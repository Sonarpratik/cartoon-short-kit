// in-place stepping for moves seen from the FRONT (the character comes toward the camera; the floor moves, not the feet sideways)
const PI = Math.PI;
export function steps(t, { T, duty = .55, lift = 60 }) {
  const out = [];
  for (let i = 0; i < 2; i++) { const ph = t / (2 * T) + i * .5, phi = ph - Math.floor(ph);
    out.push(phi < duty ? { lift: 0, u: 0, down: true } : { lift: lift * Math.sin(PI * (phi - duty) / (1 - duty)), u: (phi - duty) / (1 - duty), down: false }); }
  return { feet: out, p: (t / T) % 1, side: Math.floor(t / T) % 2, stride: (t / (2 * T)) % 1 };
}
