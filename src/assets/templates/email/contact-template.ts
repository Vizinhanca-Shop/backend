const htmlPage = ({
  title,
  category,
  description,
  name,
  whoAreYou,
  email,
  cellphone,
}) => {
  return `<!doctype html>
        <html lang="pt-BR">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }

              .email-container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border: 1px solid #dddddd;
              }

              /* Cabeçalho */
              .email-header {
                background-color: #333;
                padding: 0;
                text-align: center;
                color: #fff;
                position: relative;
              }

              .email-header img {
                width: 100%;
                height: auto;
              }

              .email-logo {
                position: absolute;
                top: 20px;
                left: 20px;
                font-size: 24px;
                font-weight: bold;
                color: #fff;
              }

              /* Corpo do Email */
              .email-body {
                padding: 30px;
                color: #321733;
                text-align: left;
              }

              .email-body h1 {
                font-size: 28px;
                color: #4b224d;
                font-weight: bold;
                margin-bottom: 10px;
              }

              .email-body h2 {
                font-size: 18px;
                color: #666;
                margin-top: 0;
                margin-bottom: 20px;
              }

              .email-body p {
                font-size: 16px;
                line-height: 1.6;
                color: #666666;
                margin-bottom: 20px;
              }

              /* Informações de Contato do Remetente */
              .contact-info {
                font-size: 14px;
                color: #321733;
                margin-top: 30px;
              }

              .contact-info p {
                margin: 5px 0;
              }

              /* Linha com ícones */
              .icon-row {
                text-align: center;
                margin: 40px 0;
                position: relative;
              }

              .icon-line {
                border-top: 1px dashed #ff4d5a;
                height: 1px;
                position: relative;
                margin: 0 20px;
              }

              .icon-start,
              .icon-end {
                position: absolute;
                top: -26px;
              }

              .icon-start {
                left: 0;
              }

              .icon-end {
                right: 0;
              }

              /* Rodapé */
              .email-footer {
                padding: 20px;
                text-align: center;
                color: #666666;
              }

              .email-footer p {
                font-size: 14px;
                color: #666666;
                margin: 5px 0;
              }

              .social-icons {
                margin-top: 10px;
              }

              .social-icons img {
                width: 24px;
                margin: 0 5px;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <!-- Cabeçalho -->
              <div class="email-header">
                <img
                  src="https://centerlight-s3.s3.sa-east-1.amazonaws.com/email/hero-banner-email.png"
                  alt="Header Image"
                />
              </div>

              <!-- Corpo do Email -->
              <div class="email-body">
                <h1>${title}</h1>
                <h2>${category}</h2>
                <p>${description}</p>

                <!-- Informações de Contato do Remetente -->
                <div class="contact-info">
                  <p><strong>${name}, ${whoAreYou}</strong></p>
                  <p>${email}</p>
                  <p>${cellphone}</p>
                </div>
              </div>

              <!-- Seção das Linhas com a Imagem -->
              <div style="text-align: center; margin: 20px 0">
                <img
                  src="https://centerlight-s3.s3.sa-east-1.amazonaws.com/email/lines-email.png"
                  alt="Linha decorativa"
                  style="width: 90%; max-width: 600px; margin-right: 26px"
                />
              </div>

              <!-- Rodapé -->
              <div class="email-footer">
                <div
                  style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                  "
                >
                  <!-- Informações de Contato -->
                  <div style="text-align: left;">
                    <p style="font-size: 18px; font-weight: bold; color: #321733; margin: 0">
                      centerlight
                    </p>
                    <p style="font-size: 14px; color: #321733; margin: 5px 0">
                      Florianópolis, <br />Santa Catarina - Brasil.
                    </p>
                  </div>

                  <!-- Informações de Contato Adicional -->
                  <div style="text-align: left; color: #959595">
                    <p style="font-size: 14px; color: #666; margin: 0; display: flex; align-items: center; margin-bottom: 16px">
                      <img
                        src="https://centerlight-s3.s3.sa-east-1.amazonaws.com/email/phone-icon.png"
                        alt="Telefone"
                        style="width: 24px; height: 24px; object-fit: contain; margin-right: 8px"
                      />
                      (48) 991262088
                    </p>
                    <p style="font-size: 14px; color: #666; margin: 0; display: flex; align-items: center;">
                      <img
                        src="https://centerlight-s3.s3.sa-east-1.amazonaws.com/email/email-icon.png"
                        alt="Email"
                        style="width: 24px; height: 24px; object-fit: contain; margin-right: 8px"
                      />
                      contato@centerlight.com.br
                    </p>
                  </div>

                  <!-- Redes Sociais -->
                  <div style="text-align: right">
                    <p style="font-size: 14px; color: #959595; margin: 0">
                      Nos acompanhe também<br />nas redes sociais
                    </p>
                    <div style="margin-top: 5px">
                      <a href="https://www.instagram.com/mymingoo/" target="_blank">
                        <img src="https://centerlight-s3.s3.sa-east-1.amazonaws.com/email/ig-icon.png" alt="Instagram" style="margin-right: 10px; width: 24px; height: 24px; object-fit: cover;" />
                      </a>
                      <a href="https://www.facebook.com/mingoooficial" target="_blank">
                        <img src="https://centerlight-s3.s3.sa-east-1.amazonaws.com/email/facebook-icon.png" alt="Facebook" style="margin-right: 10px; width: 24px; height: 24px; object-fit: cover;" />
                      </a>
                      <a href="https://www.youtube.com/channel/UC5s2aOnJu1HT62iwEqepj4g" target="_blank">
                        <img src="https://centerlight-s3.s3.sa-east-1.amazonaws.com/email/yt-icon.png" alt="YouTube" style="margin-right: 10px; width: 24px; height: 24px; object-fit: cover;" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>`
}

export default htmlPage
