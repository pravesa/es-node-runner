import http from 'http';

const port = 7000;

const server = http.createServer((req, res) => {
  res.setHeader('content-type', 'application/json');
  switch (req.url) {
    case '/test':
      res.writeHead(200);
      res.end(JSON.stringify({data: 'hello world'}));
      break;
    default:
      res.writeHead(404);
      res.end(JSON.stringify({data: 'not found'}));
      break;
  }
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('Listening on port ', port);
});
