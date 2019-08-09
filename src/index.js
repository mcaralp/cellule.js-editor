

const express = require('express')
const app = express()
const path = require('path');

app.set('view engine', 'pug');

app.use('/js/ca',  express.static(path.join(__dirname, '..', 'node_modules', 'cellule.js', 'dist')));
app.use('/js/vue', express.static(path.join(__dirname, '..', 'node_modules', 'vue', 'dist')));
app.use('/js/ace', express.static(path.join(__dirname, '..', 'node_modules', 'ace-builds', 'src-min')));
app.use('/js',     express.static(path.join(__dirname, '..', 'public', 'js')));
app.use('/css',    express.static(path.join(__dirname, '..', 'public', 'css')));
app.use('/img',    express.static(path.join(__dirname, '..', 'public', 'img')));

app.get('/', (req, res) =>
{
    res.render('index');
});

app.listen(3000, () =>
{
    console.log('Example app listening on port 3000!')
});
