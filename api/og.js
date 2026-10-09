import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

async function font(query) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${query}`)).text();
  const url = css.match(/src: url\(([^)]+)\)/)[1];
  return (await fetch(url)).arrayBuffer();
}

const h = (type, style, children) => ({ type, props: { style, children } });

export default async function handler() {
  try {
    return await render();
  } catch (e) {
    return new Response('og error: ' + (e && e.stack || e), { status: 500 });
  }
}

async function render() {
  const [regular, bold, black, serif] = await Promise.all([
    font('Geist:wght@400'),
    font('Geist:wght@700'),
    font('Geist:wght@900'),
    font('Instrument+Serif:ital@1'),
  ]);

  const tiles = [
    [760, -40, 150, '#3A3B3E'], [760, 124, 190, '#5E4B12'], [760, 328, 120, '#14383A'], [760, 462, 170, '#2A2722'],
    [910, 15, 150, '#14383A'], [910, 179, 150, '#16191E'], [910, 343, 170, '#4C4F4A'], [910, 527, 150, '#3A3B3E'],
    [1060, 70, 190, '#5E4B12'], [1060, 274, 190, '#0D4A3D'], [1060, 478, 170, '#2A2722'],
  ].map(([left, top, height, background]) =>
    h('div', { display: 'flex', position: 'absolute', left, top, width: 136, height, background, borderRadius: 10 })
  );

  const root = h('div', {
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative',
    background: '#0A0A0B', color: '#F3F2EE', fontFamily: 'Geist', padding: '64px 64px 0 64px',
  }, [
    ...tiles,
    h('div', { display: 'flex', alignItems: 'center', color: '#D7FF3A', fontSize: 22, letterSpacing: 2 }, [
      h('div', { display: 'flex', width: 14, height: 14, borderRadius: 7, background: '#D7FF3A', marginRight: 14 }, []),
      'OPEN TO WORK · BENGALURU / REMOTE',
    ]),
    h('div', { display: 'flex', fontSize: 40, marginTop: 30 }, [
      'The portfolio of ',
      h('span', { fontWeight: 700 }, 'Angel Lakra'),
    ]),
    h('div', { display: 'flex', alignItems: 'baseline', marginTop: 10 }, [
      h('span', { fontSize: 150, fontWeight: 900, letterSpacing: -6 }, 'Infinite'),
      h('span', { fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 160, marginLeft: 22 }, 'Angels'),
      h('span', { fontSize: 120, color: '#D7FF3A', marginLeft: 12 }, '∞'),
    ]),
    h('div', { display: 'flex', flexDirection: 'column', fontSize: 30, color: '#B9B8BD', marginTop: 24 }, [
      h('span', {}, 'Full-stack engineer. Python, AI and the software'),
      h('span', {}, 'small businesses run on. Told seven ways.'),
    ]),
    h('div', { display: 'flex', fontSize: 22, color: '#86858A', marginTop: 40 },
      '5+ yrs  ·  ex-Frontend Tech Lead, Chain Labs  ·  2 POS systems'),
  ]);

  const img = new ImageResponse(root, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Geist', data: regular, weight: 400, style: 'normal' },
      { name: 'Geist', data: bold, weight: 700, style: 'normal' },
      { name: 'Geist', data: black, weight: 900, style: 'normal' },
      { name: 'Instrument Serif', data: serif, weight: 400, style: 'italic' },
    ],
  });
  const buf = await img.arrayBuffer();
  return new Response(buf, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400, s-maxage=604800' },
  });
}
