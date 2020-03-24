let load_page = <HTMLDivElement>document.querySelector('.load');

window.onload = () => {
    load_page.classList.add('load-anima');
    setTimeout(() => {
        load_page.style.display = 'none';
    }, 0.5);
}