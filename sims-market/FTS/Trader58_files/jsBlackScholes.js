function bsop(id, r, t, xk, ss, sigma, dvl) {
    var d1, d2, tmp, s;

    s = ss * Math.exp(-dvl * t);

    if (id == 1) {
        d1 = Math.log(s / xk) + (r + sigma * sigma / 2) * t;
        d1 = d1 / (sigma * Math.sqrt(t));
        d2 = d1 - sigma * Math.sqrt(t);
        tmp = (s * cumnorm(d1) - xk * Math.exp(-r * t) * cumnorm(d2));
        if (tmp < 0) tmp = 0;
        return (tmp);
    }
    else {
        d1 = Math.log(s / xk) + (r + sigma * sigma / 2) * t;
        d1 = d1 / (sigma * Math.sqrt(t));
        d2 = d1 - sigma * Math.sqrt(t);
        tmp = s * (cumnorm(d1) - 1) - xk * Math.exp(-r * t) * (cumnorm(d2) - 1);
        if (tmp < 0) tmp = 0;
        return (tmp);
    }
}

function cumnorm(nrv) {
    var z1, z2, z3, csu;
    z1 = Math.abs(nrv);
    z2 = 1 / (1 + .2316419 * z1);
    z3 = .3989423 * Math.exp(-(nrv) * (nrv) / 2);
    csu = (((1.330274 * z2 - 1.821256) * z2 + 1.781478) * z2 - .356538) * z2 + .319385;
    csu = 1 - z3 * z2 * (csu);
    if (nrv < 0) csu = 1 - csu;
    return (csu);
}

function delta(id, r, t, xk, ss, sigma, dvl) {
    var d1, s;

    s = ss * Math.exp(-dvl * t);
    d1 = (Math.log(s / xk) + r * t) / (sigma * Math.pow(t, 0.5)) + 0.5 * sigma * Math.pow(t, .5);
    if (id == 1) {
        s = Math.exp(-dvl * t) * cumnorm(d1);
        return (s);
    }
    else {
        s = Math.exp(-dvl * t) * (cumnorm(d1) - 1.0);
        return (s);
    }
}

function gamma(id, r, t, xk, ss, sigma, dvl) {
    var d1, ddelta;

    d1 = Math.log(ss / xk);
    d1 = d1 + (r - dvl + sigma * sigma / 2) * t;
    d1 = d1 / (sigma * Math.sqrt(t));
    ddelta = (1.0 / (Math.sqrt(2.0 * 3.141516))) * Math.exp(-.5 * d1 * d1);
    return ddelta * Math.exp(-dvl * t) / (ss * sigma * Math.sqrt(t));

}

function vega(id, r, t, xk, ss, sigma, dvl) {
    var s, ddelta, d1;

    d1 = Math.log(ss / xk);
    d1 = d1 + (r - dvl + sigma * sigma / 2) * t;
    d1 = d1 / (sigma * Math.sqrt(t));
    ddelta = (1.0 / (Math.sqrt(2.0 * 3.141516))) * Math.exp(-.5 * d1 * d1);
    s = ddelta * Math.exp(-dvl * t) * ss * Math.sqrt(t);

    return (s);
}

function impvol(id, r, t, xk, ss, sig, tol, opr, dvl, maxit) {
    //to do
}

function theta(id, r, t, xk, ss, sigma, dvl) {
    var tmp, tmp1, tmp2, d1, d2, ddelta;

    d1 = Math.log(ss / xk) + (r - dvl + sigma * sigma / 2) * t;
    d1 = d1 / (sigma * Math.sqrt(t));
    ddelta = (1. / (Math.sqrt(2. * 3.141516))) * Math.exp(-.5 * d1 * d1);
    d2 = d1 - sigma * Math.sqrt(t);
    tmp = ss * ddelta * sigma * Math.exp(-dvl * t) / (2 * Math.sqrt(t));

    if (id == 1) {
        tmp2 = r * xk * Math.exp(-r * t) * cumnorm(d2);
        tmp1 = dvl * ss * cumnorm(d1) * Math.exp(-dvl * t);
        d2 = -tmp + tmp1 - tmp2;
    }
    else {
        tmp2 = r * xk * Math.exp(-r * t) * cumnorm(-d2);
        tmp1 = dvl * ss * cumnorm(-d1) * Math.exp(-dvl * t);
        d2 = -tmp - tmp1 + tmp2;
    }
    return (d2);
}

function rho(id, r, t, xk, ss, sigma, dvl) {
    var d1, d2, s;

    s = ss * Math.exp(-dvl * t);

    d1 = Math.log(s / xk);
    d1 = d1 + (r + sigma * sigma / 2) * t;
    d1 = d1 / (sigma * Math.sqrt(t));
    d2 = d1 - sigma * Math.sqrt(t);
    if (id == 1)
        d2 = cumnorm(d2);
    else
        d2 = cumnorm(-d2);

    d2 = xk * t * Math.exp(-r * t) * d2;
    return (d2);
}