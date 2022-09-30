const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const colaborador = new Schema({
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório.'],
    },
    telefone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    senha: {
        type: String,
        default: null,
    },
    foto: {
        type: String,
        required: true,
    },    
    dataNascimento: {
        type: String,
        required: true,
    },    
    sexo: {
        type: String,
        enum: ['M', 'F', 'Outro'], 
        required: true,
    },
    status: {
        type: String,
        enum: ['Ativo', 'Inativo'], 
        required: true,
        default: 'Ativo',
    },
    contaBancaria: {
        titular: {
            type: String,
            required: true,
        },
        cpfCnpj: {
            type: String,
            required: true,
        },
        banco: {
            type: String,
            required: true,
        },
        tipo: {

            type: String,
            required: true,
        },
        agencia: {
            
            type: String,
            required: true,
        },
        numero: {
            
            type: String,
            required: true,
        },
        digitov: {            
            type: String,
            required: true,
        },
    },
    dataCadastro: {
        type: Date,
        default: Date.now ,
    },
    recipienteId: {
        type: String,
            required: true,
    }

});

module.exports = mongoose.model('Colaborador', colaborador);