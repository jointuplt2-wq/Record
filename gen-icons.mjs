import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const s = size / 64;

  // 배경 (둥근 사각형)
  ctx.fillStyle = '#0d0d0f';
  roundRect(ctx, 0, 0, size, size, 14 * s);
  ctx.fill();

  // 노트북 바디
  ctx.fillStyle = '#1a1a2e';
  roundRect(ctx, 12*s, 10*s, 34*s, 42*s, 4*s);
  ctx.fill();
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 1.5 * s;
  roundRect(ctx, 12*s, 10*s, 34*s, 42*s, 4*s);
  ctx.stroke();

  // 스프링 바인딩 (왼쪽)
  ctx.fillStyle = '#0d0d0f';
  roundRect(ctx, 10*s, 10*s, 6*s, 42*s, 3*s);
  ctx.fill();
  ctx.strokeStyle = '#4a4a6e';
  ctx.lineWidth = 1 * s;
  roundRect(ctx, 10*s, 10*s, 6*s, 42*s, 3*s);
  ctx.stroke();

  // 스프링 구멍 (원형)
  [18, 26, 34, 42].forEach(y => {
    ctx.beginPath();
    ctx.arc(13*s, y*s, 2*s, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(99,102,241,0.85)';
    ctx.fill();
  });

  // 노트 라인
  const lines = [
    { x1: 22, x2: 40, y: 22, op: 0.7 },
    { x1: 22, x2: 38, y: 28, op: 0.45 },
    { x1: 22, x2: 35, y: 34, op: 0.3 },
  ];
  lines.forEach(({ x1, x2, y, op }) => {
    ctx.beginPath();
    ctx.moveTo(x1*s, y*s);
    ctx.lineTo(x2*s, y*s);
    ctx.strokeStyle = `rgba(99,102,241,${op})`;
    ctx.lineWidth = 1.5 * s;
    ctx.lineCap = 'round';
    ctx.stroke();
  });

  // 회로 패턴
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 1.2 * s;
  ctx.lineCap = 'round';

  // 수평선
  ctx.beginPath();
  ctx.moveTo(22*s, 44*s);
  ctx.lineTo(30*s, 44*s);
  ctx.stroke();

  // 꺾임 수직
  ctx.beginPath();
  ctx.moveTo(30*s, 44*s);
  ctx.lineTo(30*s, 40*s);
  ctx.stroke();

  // 꺾임 수평
  ctx.beginPath();
  ctx.moveTo(30*s, 40*s);
  ctx.lineTo(36*s, 40*s);
  ctx.stroke();

  // 노드
  [{ x: 30, y: 44, r: 1.5, c: '#06b6d4' }, { x: 30, y: 40, r: 1.5, c: '#06b6d4' }].forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x*s, n.y*s, n.r*s, 0, Math.PI * 2);
    ctx.fillStyle = n.c;
    ctx.fill();
  });

  // 엔드 노드 글로우
  ctx.beginPath();
  ctx.arc(36*s, 40*s, 4*s, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(99,102,241,0.25)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(36*s, 40*s, 2*s, 0, Math.PI * 2);
  ctx.fillStyle = '#6366f1';
  ctx.fill();

  return canvas.toBuffer('image/png');
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

writeFileSync('icon-192.png', drawIcon(192));
writeFileSync('icon-512.png', drawIcon(512));
console.log('✅ icon-192.png, icon-512.png 생성 완료');
