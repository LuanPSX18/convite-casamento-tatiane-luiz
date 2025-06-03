// api/submitForm.js
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();

// Middleware para permitir que a Vercel leia o corpo da requisição
// e para parsear dados de formulário urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint da API para receber os dados do formulário
app.post('/api/submitForm', async (req, res) => {
    // Pega os dados do corpo da requisição
    // O nome dos campos (name_convidado, comparecera) deve ser EXATAMENTE igual
    // ao atributo 'name' dos inputs no seu formulário HTML
    const { nome_convidado, comparecera } = req.body;

    console.log('Dados recebidos:', req.body); // Para debug na Vercel

    // Validação simples dos dados
    if (!nome_convidado || !comparecera) {
        return res.status(400).json({ message: 'Nome e confirmação são obrigatórios.' });
    }

    // Configuração do Nodemailer
    // IMPORTANTE: Use variáveis de ambiente para suas credenciais de e-mail!
    // Não coloque seu e-mail e senha diretamente no código.
    // A Vercel permite configurar "Environment Variables".
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Ou outro serviço de e-mail (SendGrid, Outlook365, etc.)
        auth: {
            user: process.env.EMAIL_USER, // Variável de ambiente para o e-mail
            pass: process.env.EMAIL_PASS  // Variável de ambiente para a senha
        },
        // Para Gmail, pode ser necessário configurar "Acesso a app menos seguro"
        // ou, idealmente, usar uma "Senha de aplicativo"
        // https://support.google.com/accounts/answer/185833
    });

    // Opções do e-mail
    const mailOptions = {
        from: `"Confirmação Casamento" <${process.env.EMAIL_USER}>`, // Seu e-mail (remetente)
        to: process.env.EMAIL_TO_FRIEND, // E-mail da sua amiga (destinatário)
        subject: `Nova Confirmação de Presença: ${nome_convidado}`,
        html: `
            <p>Olá!</p>
            <p>Uma nova confirmação de presença foi recebida:</p>
            <ul>
                <li><strong>Nome do Convidado:</strong> ${nome_convidado}</li>
                <li><strong>Comparecerá:</strong> ${comparecera.toUpperCase()}</li>
            </ul>
            <p>Atenciosamente,</p>
            <p>Sistema de Confirmação do Convite</p>
        `
    };

    try {
        // Envia o e-mail
        await transporter.sendMail(mailOptions);
        console.log('E-mail enviado com sucesso para:', process.env.EMAIL_TO_FRIEND);
        // Envia uma resposta de sucesso para o front-end
        // Você pode redirecionar para uma página de "obrigado" ou mostrar uma mensagem
        return res.status(200).json({ message: 'Confirmação enviada com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        // Log detalhado do erro para a Vercel
        console.error('Detalhes do erro Nodemailer:', error.message, error.stack);
        // Envia uma resposta de erro para o front-end
        return res.status(500).json({ message: 'Erro ao enviar confirmação. Tente novamente mais tarde.' });
    }
});

// Exporta o app para a Vercel (ou para rodar localmente)
// A Vercel espera que o arquivo exporte a instância do Express
module.exports = app;

// Para rodar localmente (opcional, para testes antes do deploy):
// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`Servidor rodando na porta ${PORT}`);
//   console.log(`Aguardando requisições POST em http://localhost:${PORT}/api/submitForm`);
// });