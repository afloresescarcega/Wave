export var mod = function (n, m) {
  var remain = n % m;
  return Math.floor(remain >= 0 ? remain : remain + m);
};
