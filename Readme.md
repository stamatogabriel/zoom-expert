# Zoom expert

Aplicação baseada no Zoom desenvolvida durante a 2a Semana Javascript Expert com o intuito de aprender como funciona a transmissão de áudio e vídeo em tempo real, de forma similar ao aplicativo Zoom.

## Requisitos
- NodeJs instalado
- Docker e Docker Compose intalados
## Como executar
- Primeiramente execute o script que está em `restore-packages.sh`
- Execute `docker-compose up`
- Abra o navegador na url [http://localhost:8080](http://localhost:8080)
- Clique em qualquer um dos ícones
- Dê um nome para a sala
- Para gravar a seção basta clicar em `record`
- Quando clicar em `end` a seção encerrará e será feito o download das gravações se houver