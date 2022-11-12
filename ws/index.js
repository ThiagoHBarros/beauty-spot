const express = require('express');
const app = express();
const morgan = require('morgan');
const busboy = require('connect-busboy');




require('./database');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(busboy());



//variaveis
app.set('port', 8000);

//rotas
app.use('/salao', require('./src/routes/salao.routes'));
app.use('/servico', require('./src/routes/servico.routes'));
app.use('/colaborador', require('./src/routes/colaborador.routes'));
app.use('/horario', require('./src/routes/horario.routes'));
app.use('/agendamento', require('./src/routes/agendamento.routes'));
app.use('/cliente', require('./src/routes/cliente.routes'));


app.listen(app.get('port'), () => {
    console.log(`WS está rodando na porta ${app.get('port')}`);
}); 

