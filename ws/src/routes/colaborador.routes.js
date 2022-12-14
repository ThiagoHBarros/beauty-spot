const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const moment = require('moment')
const pagarme = require('../services/pagarme')
const Colaborador = require('../models/colaborador')
const salaoColaborador = require('../models/relacionamento/salaoColaborador')
const colaboradorServico = require('../models/relacionamento/colaboradorServico')
router.post('/', async(req, res) => {
    const db = mongoose.connection
    const session = await db.startSession()
    session.startTransaction()
    try {
        const { colaborador, salaoId, colaboradores } = req.body
        let novoColaborador = null
            //verificar existĂȘncia do colaborador
        const existentColaborador = await Colaborador.findOne({
                $or: [
                     { email: colaboradores.email },
                    { telefone: colaboradores.telefone }
                ]
            })
            //caso o colaborador for inexistente, cadastre-o
        if (!existentColaborador) {
            //criaremos primeiro a conta Bancaria
            const { contaBancaria } = colaborador
            const pagarmeContaBancaria = await pagarme('/bank_accounts', {
                agencia: contaBancaria.agencia,
                bank_code: contaBancaria.Banco,
                conta: contaBancaria.numero,
                type: contaBancaria.TipoConta,
                conta_dv: contaBancaria.dv,
                document_number: contaBancaria.cpfCnpj,
                legal_name: contaBancaria.titular
            })
            if (pagarmeContaBancaria.error) {
                throw pagarmeContaBancaria
            }
            //criar recebedor
            const pagarmeRecebedor = await pagarme('/recipients', {
                transfer_interval: 'daily',
                transfer_enabled: true,
                bank_account_id: pagarmeContaBancaria.data.id
            })
            if (pagarmeRecebedor.error) {
                throw pagarmeRecebedor
            }
            //criar colaborador
            novoColaborador = await new Colaborador({
                ...colaborador,
                recipienteId: pagarmeRecebedor.data.id
            }).save({ session })
        }
        //relacionamento
        const colaboradorId = existentColaborador ? existentColaborador._id : novoColaborador._id
            //verificar relacionamento entree SalĂŁo e Colaborador
        const relacionamentoExistente = await salaoColaborador.findOne({
                salaoId,
                colaboradorId
            })
            //se nao houver a relaĂ§ĂŁo
        if (!relacionamentoExistente) {
            await new salaoColaborador({
                salaoId,
                colaboradorId,
                status: colaborador.vinculo
            }).save({ session })
        }
        // se houver a relaĂ§ĂŁo
        if (existentColaborador && relacionamentoExistente.status === 'I') {
            await salaoColaborador.findOneAndUpdate({
                salaoId,
                colaboradorId,
            }, { status: 'A' }, { session })
        }
        //relacionamento com os servicos
        await colaboradorServico.insertMany(
            colaborador.servicos.map(servicoId => ({
                servicoId,
                colaboradorId
            }))
        )
        await session.commitTransaction()
        session.endSession()
        if (existentColaborador && relacionamentoExistente) {
            res.json({ error: true, message: 'Colaborador jĂĄ Cadastrado' })
        } else {
            res.json({ message: 'Colaborador cadastrado com Sucesso' })
        }
        //Apagar vinculos de serviĂ§os
    } catch (err) {
        await session.abortTransaction()
        session.endSession()
        res.json({ error: true, message: err.message })
    }
})
router.put('/:colaboradorId', async(req, res) => {
    try {
        const { vinculo, vinculoId, especialidades } = req.body
        const { colaboradorId } = req.params
            //vinculo
        await salaoColaborador.findByIdAndUpdate(
                vinculoId, {
                    status: vinculo
                })
            //Servicos
        await colaboradorServico.deleteMany({
            colaboradorId
        })
        await colaboradorServico.insertMany(
            especialidades.map((servicoId) => ({
                servicoId,
                colaboradorId
            }))
        )
        res.json({ Vinculos_ServiĂ§os: 'Atualizados com sucesso' })
    } catch (err) {
        res.json({ error: true, message: err.message })
    }
})
router.delete('/vinculo/:id', async(req, res) => {
    try {
        await salaoColaborador.findByIdAndUpdate(
            req.params.id, { status: 'E' }
        )
        res.json({ Vinculo: "Deletado Com Sucesso" })
    } catch (err) {
        res.json({ error: true, message: err.message })
    }
})
router.post('/filter', async(req, res) => {
    try {
        const colaboradores = await Colaborador.find(req.body.filters)
        res.json({ colaboradores })
    } catch (err) {
        res.json({ error: true, message: err.message })
    }
})
router.get('/salao/:salaoId', async(req, res) => {
    try {
        const { salaoId } = req.params;
        let listaColaboradores = [];
    
        const colaboradores = await salaoColaborador.find({
          salaoId,
          status: { $ne: 'E' },
        })
          .populate('colaboradorId')
          .select('colaboradorId dataCadastro status');
    
        for (let colaborador of colaboradores) {
          const especialidades = await colaboradorServico.find({
            colaboradorId: colaborador.colaboradorId._id,
          }).populate('servicoId')
          console.log(listaColaboradores)
          listaColaboradores.push({
            ...colaborador.colaboradorId._doc,
            especialidades: especialidades.map((e) => e.servicoId && e.servicoId._id),
            servicos: especialidades.map((e) => e.servicoId && e.servicoId.descricao).join(', '),
            dataNascimento: moment(colaborador.dataNascimento).toDate()
          });
        }
        res.json({
          error: false,
          Colaboradores: listaColaboradores.map((c) => ({
            ...c,
            vinculoId: c._id,
            vinculo: c.status,
            especialidades: c.especialidades,
            dataCadastro: c.dataCadastro
          }))
        });
      } catch (err) {
        res.json({ error: true, message: err.message });
      }
    })
module.exports = router