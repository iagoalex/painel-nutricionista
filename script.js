let logoBase64 = null;

    function carregarLogo(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          logoBase64 = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    }

    function openTab(tabId, evt) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      
      document.getElementById(tabId).classList.add('active');
      evt.currentTarget.classList.add('active');
    }

    function addRow(tableId, cols) {
      const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
      const newRow = table.insertRow();
      for (let i = 0; i < cols; i++) {
        let cell = newRow.insertCell(i);
        cell.innerHTML = `<input type="text" placeholder="Preencher...">`;
      }
    }

    function addRowPlano(tableId) {
      const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
      const newRow = table.insertRow();
      newRow.innerHTML = `
        <td><input type="text" placeholder="Ex: 15:30 - Lanche"></td>
        <td><textarea placeholder="Opções e alimentos..."></textarea></td>
        <td><textarea placeholder="Orientações e modo de preparo..."></textarea></td>
      `;
    }

    function formatarData(dataIso) {
      if (!dataIso) return '';
      const partes = dataIso.split('-');
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
      return dataIso;
    }

    function gerarPDF(tipo) {
      // 1. Atualizar informações
      const nutriNome = document.getElementById('nutri_nome').value;
      const nutriCrn = document.getElementById('nutri_crn').value;
      const nutriEmail = document.getElementById('nutri_email').value;
      const nutriFone = document.getElementById('nutri_fone').value;
      const nutriInsta = document.getElementById('nutri_insta').value;
      const pacienteNome = document.getElementById('paciente_nome').value;
      const dataDocRaw = document.getElementById('doc_data').value;
      const dataDocFormatted = formatarData(dataDocRaw);

      const logoImg = document.getElementById('pdf_logo_img');
      if (logoBase64) {
        logoImg.src = logoBase64;
        logoImg.style.display = 'block';
      } else {
        logoImg.style.display = 'none';
      }

      document.getElementById('pdf_h_nome').innerText = nutriNome || ' ';
      document.getElementById('pdf_h_crn').innerText = nutriCrn ? `NUTRICIONISTA | ${nutriCrn}` : ' ';
      document.getElementById('pdf_h_contato').innerHTML = `
        ${nutriEmail ? 'E-mail: ' + nutriEmail + '<br>' : ''}
        ${nutriFone ? 'Contato: ' + nutriFone + '<br>' : ''}
        ${nutriInsta ? 'Instagram: ' + nutriInsta : ''}
      `;

      document.getElementById('pdf_p_nome').innerText = pacienteNome || ' ';
      document.getElementById('pdf_p_details').innerText = dataDocFormatted ? `Data: ${dataDocFormatted}` : ' ';

      document.getElementById('pdf_sig_nome').innerText = nutriNome || ' ';
      document.getElementById('pdf_sig_crn').innerText = nutriCrn || ' ';

      document.getElementById('pdf_f_email').innerText = nutriEmail ? `E-MAIL: ${nutriEmail.toUpperCase()}` : '';
      document.getElementById('pdf_f_fone').innerText = nutriFone ? `TEL: ${nutriFone}` : '';
      document.getElementById('pdf_f_insta').innerText = nutriInsta ? `INSTAGRAM: ${nutriInsta}` : '';

      // 2. Montar Conteúdo Específico
      const contentArea = document.getElementById('pdf-dynamic-content');
      contentArea.innerHTML = '';

      if (tipo === 'antropometria') {
        const dataAntRaw = document.getElementById('antro_data_anterior').value;
        const dataAntFormatted = formatarData(dataAntRaw);
        const subInfo = document.getElementById('antro_sub').value;
        const nota = document.getElementById('antro_nota').value;

        if(subInfo) {
          const currentDetails = document.getElementById('pdf_p_details').innerText;
          document.getElementById('pdf_p_details').innerText = currentDetails.trim() ? `${currentDetails} · ${subInfo}` : subInfo;
        }

        const headerAnterior = dataAntFormatted ? `Avaliação Anterior (${dataAntFormatted})` : 'Avaliação Anterior';
        const headerAtual = dataDocFormatted ? `Avaliação Atual (${dataDocFormatted})` : 'Avaliação Atual';

        let html = `<div class="pdf-doc-title">Evolução Antropométrica</div>`;
        html += `<table class="pdf-table">
          <thead>
            <tr>
              <th style="width: 25%;">Indicador</th>
              <th style="width: 22%;">${headerAnterior}</th>
              <th style="width: 22%;">${headerAtual}</th>
              <th style="width: 16%;">Referência</th>
              <th style="width: 15%;">Evolução</th>
            </tr>
          </thead>
          <tbody>`;

        const rows = document.querySelectorAll('#table-antropometria tbody tr');
        rows.forEach(row => {
          const inputs = row.querySelectorAll('input');
          html += `<tr>
            <td><strong>${inputs[0].value || '&nbsp;'}</strong></td>
            <td>${inputs[1].value || '&nbsp;'}</td>
            <td>${inputs[2].value || '&nbsp;'}</td>
            <td>${inputs[3].value || '&nbsp;'}</td>
            <td>${inputs[4].value || '&nbsp;'}</td>
          </tr>`;
        });

        html += `</tbody></table>`;
        if(nota) html += `<p style="font-size: 8px; color: #64748b; font-style: italic; margin-top: 8px;">${nota}</p>`;
        contentArea.innerHTML = html;

      } else if (tipo === 'exames') {
        const lista = document.getElementById('exames_lista').value.split('\n');
        const objetivo = document.getElementById('exames_objetivo').value;

        let html = `<div class="pdf-doc-title">Solicitação de Exames Laboratoriais</div>`;
        html += `<p style="font-size:10.5px; margin-bottom:12px; color:#334155;">Solicito a realização dos seguintes exames complementares:</p>`;
        
        html += `<ul style="font-size:10.5px; margin-left: 20px; line-height: 1.7; color: #1e293b;">`;
        lista.forEach(item => {
          if(item.trim() !== '') {
            html += `<li>${item}</li>`;
          }
        });
        html += `</ul>`;

        if(objetivo) {
          html += `<div style="margin-top:20px; padding: 10px 14px; background:#f8fafc; border: 1px dashed #cbd5e1; font-size:9.5px; color:#475569; border-radius:4px;">${objetivo}</div>`;
        }
        contentArea.innerHTML = html;

      } else if (tipo === 'plano') {
        const obs = document.getElementById('plano_obs').value;

        let html = `<div class="pdf-doc-title">Plano Alimentar</div>`;
        if(obs) html += `<p style="font-size:10.5px; margin-bottom:12px; color:#475569; font-style:italic;">${obs}</p>`;

        html += `<table class="pdf-table">
          <thead>
            <tr>
              <th style="width:22%;">Horário / Refeição</th>
              <th style="width:43%;">Alimentos / Substituições</th>
              <th style="width:35%;">Orientações</th>
            </tr>
          </thead>
          <tbody>`;

        const rows = document.querySelectorAll('#table-plano tbody tr');
        rows.forEach(row => {
          const hor = row.querySelector('td:nth-child(1) input').value;
          const ali = row.querySelector('td:nth-child(2) textarea').value.replace(/\n/g, '<br>');
          const ori = row.querySelector('td:nth-child(3) textarea').value.replace(/\n/g, '<br>');

          html += `<tr>
            <td><strong>${hor || '&nbsp;'}</strong></td>
            <td>${ali || '&nbsp;'}</td>
            <td>${ori || '&nbsp;'}</td>
          </tr>`;
        });

        html += `</tbody></table>`;
        contentArea.innerHTML = html;
      }

      // 3. Captura com Quebra de Tabela Suave (mode: css e legacy)
      const wrapper = document.getElementById('pdfWrapper');
      wrapper.style.visibility = 'visible';
      wrapper.style.zIndex = '99999';

      const element = document.getElementById('pdf-render');
      const fileName = pacienteNome ? `${tipo}_${pacienteNome.replace(/\s+/g, '_')}.pdf` : `${tipo}.pdf`;

      const opt = {
        margin:       [30, 0, 30, 0],
        filename:     fileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          scrollY: 0,
          scrollX: 0,
          windowScrollY: 0,
          windowScrollX: 0
        },
        jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] } /* Permite que a tabela comece na pág 1 e flua livremente pelas próximas */
      };

      html2pdf().set(opt).from(element).save().then(() => {
        wrapper.style.visibility = 'hidden';
        wrapper.style.zIndex = '-9999';
      });
    }

















// ==========================================================================
// CONFIGURAÇÃO DO GOOGLE SHEETS PARA AUTENTICAÇÃO
// ==========================================================================
const GOOGLE_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHfoDveEPNk5Vg1NOlEEILZsrAf7OAlBf8-MR4xyUsGV3tNcxJkd21OEmwE4JyxXPB5MIsBUGozyOS/pub?output=csv";

// Credenciais de emergência (Caso a planilha não esteja configurada ou fique offline)
const LOGIN_BACKUP = { usuario: "piethro", senha: "nutri2026", usuario: "admin", senha: "iago1996"};

async function autenticar() {
  const userInput = document.getElementById('login_user').value.trim();
  const passInput = document.getElementById('login_pass').value.trim();
  const loginError = document.getElementById('loginError');
  const btnLogin = document.getElementById('btnLogin');
  const btnText = document.getElementById('btnText');

  if (loginError) loginError.style.display = 'none';

  if (!userInput || !passInput) {
    exibirErro("Por favor, preencha o usuário e a senha.");
    return;
  }

  // Estado de carregamento no botão
  if (btnLogin) btnLogin.disabled = true;
  if (btnText) btnText.innerText = "Verificando...";

  let acessoPermitido = false;

  // 1. Tenta validar via Google Sheets
  if (GOOGLE_SHEETS_CSV_URL) {
    try {
      // Adicionado parâmetro nocache para evitar resposta antiga do navegador
      const cacheBusterUrl = GOOGLE_SHEETS_CSV_URL + (GOOGLE_SHEETS_CSV_URL.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
      const response = await fetch(cacheBusterUrl);
      
      if (response.ok) {
        const text = await response.text();
        const linhas = parseCSV(text);

        // Percorre a planilha buscando correspondência (Ignora o cabeçalho)
        for (let i = 1; i < linhas.length; i++) {
          if (linhas[i].length >= 2) {
            const u = linhas[i][0];
            const s = linhas[i][1];

            if (u && s && u.toLowerCase() === userInput.toLowerCase() && s === passInput) {
              acessoPermitido = true;
              break;
            }
          }
        }
      }
    } catch (error) {
      console.warn("Falha ao consultar Google Sheets. Tentando credencial de emergência...", error);
    }
  }

  // 2. Se a planilha não conceder ou falhar, valida via backup
  if (!acessoPermitido) {
    if (userInput.toLowerCase() === LOGIN_BACKUP.usuario.toLowerCase() && passInput === LOGIN_BACKUP.senha) {
      acessoPermitido = true;
    }
  }

  // 3. Resposta visual
  if (btnLogin) btnLogin.disabled = false;
  if (btnText) btnText.innerText = "Entrar no Sistema";

  if (acessoPermitido) {
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    if (loginScreen) loginScreen.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';
  } else {
    exibirErro("Usuário ou senha incorretos!");
  }
}

// Auxiliar robusto para ler CSV tratando delimitadores (, ou ;) e aspas
function parseCSV(text) {
  const linhas = text.split(/\r?\n/);
  return linhas.map(row => {
    // Detecta se a linha utiliza vírgula ou ponto e vírgula como separador
    const delimiter = row.includes(';') ? ';' : ',';
    return row.split(delimiter).map(cell => {
      return cell.replace(/^"(.*)"$/, '$1').replace(/\r/g, '').trim();
    });
  }).filter(row => row.length > 0 && row.some(cell => cell !== ''));
}

function exibirErro(mensagem) {
  const loginError = document.getElementById('loginError');
  if (loginError) {
    loginError.innerText = mensagem;
    loginError.style.display = 'block';
  }
}

function logout() {
  const loginScreen = document.getElementById('loginScreen');
  const mainApp = document.getElementById('mainApp');
  if (loginScreen) loginScreen.style.display = 'flex';
  if (mainApp) mainApp.style.display = 'none';
  
  const userInput = document.getElementById('login_user');
  const passInput = document.getElementById('login_pass');
  if (userInput) userInput.value = '';
  if (passInput) passInput.value = '';
}