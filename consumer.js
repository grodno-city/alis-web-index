process.stdin.on('readable', () => {
  const chunk = process.stdin.read();
  if (chunk !== null) {
    if (chunk[0] !== 10) {
      const data = JSON.parse(chunk);
      console.log(data.msg);
    } else  console.log(chunk[0]);
  }
});

process.stdin.on('end', () => {
  process.stdout.write('end');
});
