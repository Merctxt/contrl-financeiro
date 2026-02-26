import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout/Layout';
import { FiArrowLeft, FiShield } from 'react-icons/fi';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const { token } = useAuth();

  const content = (
    <div className="privacy-policy-page fade-in">
      <div className="privacy-header">
        <Link to={token ? "/settings" : "/login"} className="back-link">
          <FiArrowLeft /> Voltar
        </Link>
        <div className="header-title">
          <FiShield className="privacy-icon" />
          <h1>Política de Privacidade</h1>
        </div>
        <p className="last-updated">Última atualização: 26 de fevereiro de 2026</p>
      </div>

      <div className="privacy-content card">
        <section>
          <h2>1. Introdução</h2>
          <p>
            Bem-vindo ao Ctrl Financeiro. Esta Política de Privacidade descreve como coletamos, 
            usamos, armazenamos e protegemos suas informações pessoais quando você utiliza 
            nossa aplicação de controle financeiro pessoal.
          </p>
          <p>
            Ao utilizar o Ctrl Financeiro, você concorda com a coleta e uso de informações 
            de acordo com esta política. Comprometemo-nos a proteger sua privacidade e 
            manter seus dados financeiros seguros.
          </p>
        </section>

        <section>
          <h2>2. Informações que Coletamos</h2>
          
          <h3>2.1 Informações de Conta</h3>
          <ul>
            <li><strong>Nome:</strong> Para personalização da sua experiência</li>
            <li><strong>E-mail:</strong> Para autenticação, recuperação de senha e comunicações importantes</li>
            <li><strong>Senha:</strong> Armazenada de forma criptografada (hash) para segurança</li>
          </ul>

          <h3>2.2 Dados Financeiros</h3>
          <ul>
            <li>Transações (receitas e despesas)</li>
            <li>Categorias personalizadas</li>
            <li>Metas financeiras</li>
            <li>Orçamentos e limites de gastos</li>
          </ul>

          <h3>2.3 Informações de Uso</h3>
          <ul>
            <li>Endereço IP e localização aproximada</li>
            <li>Tipo de dispositivo e navegador</li>
            <li>Horários de acesso e atividades na plataforma</li>
            <li>Sessões ativas e histórico de login</li>
          </ul>
        </section>

        <section>
          <h2>3. Como Usamos Suas Informações</h2>
          <p>Utilizamos suas informações pessoais para:</p>
          <ul>
            <li>Fornecer e manter o serviço de controle financeiro</li>
            <li>Personalizar sua experiência e oferecer insights relevantes</li>
            <li>Processar suas transações e cálculos financeiros</li>
            <li>Enviar notificações importantes sobre sua conta</li>
            <li>Monitorar atividades suspeitas e prevenir fraudes</li>
            <li>Melhorar nossos serviços através de análises agregadas</li>
            <li>Recuperação de senha e suporte técnico</li>
          </ul>
        </section>

        <section>
          <h2>4. Armazenamento e Segurança</h2>
          
          <h3>4.1 Onde Armazenamos</h3>
          <p>
            Seus dados são armazenados em servidores seguros hospedados pela Railway. 
            Utilizamos banco de dados PostgreSQL com criptografia em trânsito e em repouso.
          </p>

          <h3>4.2 Medidas de Segurança</h3>
          <ul>
            <li>Senhas criptografadas com algoritmo bcrypt</li>
            <li>Tokens de sessão com hash SHA-256</li>
            <li>Conexões HTTPS/TLS para todas as comunicações</li>
            <li>Autenticação JWT (JSON Web Tokens)</li>
            <li>Monitoramento de sessões ativas</li>
            <li>Cache local apenas para dados não sensíveis</li>
          </ul>

          <h3>4.3 Retenção de Dados</h3>
          <p>
            Mantemos suas informações enquanto sua conta estiver ativa. Quando você 
            excluir sua conta, todos os seus dados pessoais e financeiros serão 
            permanentemente removidos de nossos servidores em até 30 dias.
          </p>
        </section>

        <section>
          <h2>5. Compartilhamento de Informações</h2>
          <p>
            <strong>NÃO vendemos, alugamos ou compartilhamos suas informações pessoais 
            com terceiros para fins comerciais.</strong>
          </p>
          <p>Podemos compartilhar dados apenas nas seguintes situações:</p>
          <ul>
            <li><strong>Provedores de Serviço:</strong> Railway (hospedagem), Mailgun (e-mails transacionais)</li>
            <li><strong>Obrigações Legais:</strong> Quando exigido por lei ou ordem judicial</li>
            <li><strong>Proteção de Direitos:</strong> Para proteger nossos direitos legais ou prevenir atividades ilegais</li>
          </ul>
        </section>

        <section>
          <h2>6. Seus Direitos</h2>
          <p>Você tem direito a:</p>
          <ul>
            <li><strong>Acessar:</strong> Ver todos os dados que temos sobre você</li>
            <li><strong>Corrigir:</strong> Atualizar informações incorretas ou desatualizadas</li>
            <li><strong>Exportar:</strong> Baixar suas transações em formato CSV</li>
            <li><strong>Excluir:</strong> Remover permanentemente sua conta e todos os dados</li>
            <li><strong>Revogar Sessões:</strong> Encerrar sessões ativas em outros dispositivos</li>
            <li><strong>Optar por Não Receber:</strong> Desativar notificações não essenciais</li>
          </ul>
        </section>

        <section>
          <h2>7. Cookies e Armazenamento Local</h2>
          <p>
            Utilizamos localStorage do navegador para armazenar:
          </p>
          <ul>
            <li>Token de autenticação (JWT)</li>
            <li>Preferências de tema (claro/escuro)</li>
            <li>Cache temporário de dados não sensíveis (com TTL de 1-5 minutos)</li>
          </ul>
          <p>
            Você pode limpar esses dados a qualquer momento através das configurações 
            do seu navegador. Isso resultará em logout automático.
          </p>
        </section>

        <section>
          <h2>8. Privacidade de Menores</h2>
          <p>
            Nosso serviço não é direcionado a menores de 18 anos. Não coletamos 
            intencionalmente informações de crianças. Se você acredita que coletamos 
            dados de um menor, entre em contato conosco imediatamente.
          </p>
        </section>

        <section>
          <h2>9. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos 
            sobre mudanças significativas através de:
          </p>
          <ul>
            <li>E-mail para o endereço cadastrado</li>
            <li>Aviso destacado na aplicação</li>
            <li>Atualização da data "Última atualização" no topo desta página</li>
          </ul>
          <p>
            Recomendamos revisar esta política periodicamente. O uso continuado do 
            serviço após alterações constitui aceitação das novas condições.
          </p>
        </section>

        <section>
          <h2>10. Lei Geral de Proteção de Dados (LGPD)</h2>
          <p>
            Estamos em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei 
            nº 13.709/2018). Você tem todos os direitos previstos pela LGPD, incluindo:
          </p>
          <ul>
            <li>Confirmação da existência de tratamento</li>
            <li>Acesso aos dados</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados</li>
            <li>Anonimização, bloqueio ou eliminação de dados</li>
            <li>Portabilidade dos dados a outro fornecedor</li>
            <li>Revogação do consentimento</li>
          </ul>
        </section>

        <section>
          <h2>11. Contato</h2>
          <p>
            Para exercer seus direitos, tirar dúvidas ou fazer solicitações relacionadas 
            a esta Política de Privacidade, entre em contato conosco:
          </p>
          <div className="contact-info">
            <p><strong>E-mail:</strong> contato@giovannidev.com</p>
            <p><strong>Tempo de Resposta:</strong> Até 3 dias úteis</p>
          </div>
        </section>

        <div className="policy-footer">
          <p>
            Esta política foi elaborada para garantir transparência sobre como tratamos 
            seus dados. Seu controle financeiro merece segurança e privacidade total.
          </p>
          <p className="footer-tagline">
            <FiShield /> Ctrl Financeiro - Seu dinheiro, suas regras, sua privacidade.
          </p>
        </div>
      </div>
    </div>
  );

  // Se o usuário estiver logado, usa o Layout. Senão, renderiza direto
  if (token) {
    return <Layout>{content}</Layout>;
  }

  return (
    <div className="privacy-public-wrapper">
      {content}
    </div>
  );
};

export default PrivacyPolicy;
