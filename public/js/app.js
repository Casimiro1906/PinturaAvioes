function iniciar() {

    const nome = document.getElementById('nome').value.trim();
    const aviao = document.getElementById('aviao').value;

    if (!nome) {
        alert('Introduz o teu nome');
        return;
    }

    localStorage.setItem('nome', nome);
    localStorage.setItem('aviao', aviao);
    localStorage.setItem('inicio', Date.now());

    location.href = 'pintura.html';
}