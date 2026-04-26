import express from 'express';
import path from 'path';

const app = express();

// penting: akses folder public
app.use(express.static('public'));

// route dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.resolve('public/dashboard.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.resolve('public/login.html'));
});

app.get('/lupa', (req, res) => {
  res.sendFile(path.resolve('public/lupa.html'));
});

app.get('/daftar', (req, res) => {
  res.sendFile(path.resolve('public/daftar.html'));
});

app.get('/routes', (req, res) => {
  res.sendFile(path.resolve('public/routes.html'));
});

app.get('/book', (req, res) => {
  res.sendFile(path.resolve('public/book.html'));
});

app.get('/ticket', (req, res) => {
  res.sendFile(path.resolve('public/ticket.html'));
});


app.listen(3000, () => {
  console.log('http://localhost:3000/dashboard');
});