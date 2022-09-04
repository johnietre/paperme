use std::env;
use std::fs;
use std::io::prelude::*;
use std::path::Path;

macro_rules! die {
    ($($arg:tt)*) => ({
        eprintln!($($arg)*);
        ::std::process::exit(1);
    });
}

fn main() {
    let mut args = env::args();
    args.next();
    let outdir = if let Some(dir) = args.next() {
        dir
    } else {
        die!("must provide output dir and input file(s)")
    };
    for fname in args {
        // Read the file contents into memory
        let contents = match fs::read_to_string(&fname) {
            Ok(contents) => contents,
            Err(e) => {
                eprintln!("error reading {}: {}", fname, e);
                continue;
            }
        };
        // Create the new file
        let mut out_fname = Path::new(&outdir).to_path_buf();
        out_fname.push(
            Path::new(&fname).with_extension("pb.ts").file_name().unwrap()
        );
        let mut out_file = match fs::File::create(&out_fname) {
            Ok(f) => f,
            Err(e) => {
                eprintln!("error creating file {}: {}", out_fname.display(), e);
                continue;
            }
        };
        // Read through the file lines
        let mut depth = 0usize;
        let mut doffset = 0usize;
        for line in contents.lines() {
            // Tokenize the line
            let toks = line.split_ascii_whitespace().collect::<Vec<_>>();
            if toks.len() == 0 {
                continue;
            }
            if toks.len() == 1 {
                if toks[0] == "}" {
                    if depth != 0 {
                        depth -= 1;
                    }
                    if let Err(e) = out_file.write(b"}\n") {
                        eprintln!("error writing to {}: {}", out_fname.display(), e);
                    }
                }
                continue;
            }
            let (tokens, arr) = if toks[0] == "repeated" {
                (&toks[1..], true)
            } else {
                (&toks[..], false)
            };
            if tokens.len() == 1 {
                continue;
            }
            let new_line = match tokens[0] {
                "message" => {
                    depth += 1;
                    doffset = 1;
                    format!("interface {} {{", tokens[1])
                }
                "string" => {
                    if arr {
                        format!("{}: string[];", tokens[1])
                    } else {
                        format!("{}: string;", tokens[1])
                    }
                }
                "bool" => {
                    if arr {
                        format!("{}: bool[];", tokens[1])
                    } else {
                        format!("{}: bool;", tokens[1])
                    }
                }
                t if t.ends_with("32") || t.ends_with("64") => {
                    if arr {
                        format!("{}: number[];", tokens[1])
                    } else {
                        format!("{}: number;", tokens[1])
                    }
                }
                "bytes" => {
                    if arr {
                        format!("{}: number[][];", tokens[1])
                    } else {
                        format!("{}: number[];", tokens[1])
                    }
                }
                "//" => toks.join(" "),
                _ => continue,
            };
            let new_line = "\t".repeat(depth - doffset) + &new_line + "\n";
            if let Err(e) = out_file.write(new_line.as_bytes()) {
                eprintln!("error writing to {}: {}", out_fname.display(), e);
            }
            doffset = 0;
        }
    }
}
