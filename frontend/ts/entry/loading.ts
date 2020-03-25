
import ico from '../../image/go.png'

let load_page = <HTMLDivElement>document.querySelector('.load');

window.onload = () => {
    load_page.classList.add('load-anima');
    setTimeout(() => {
        load_page.style.display = 'none';
    }, 0.5);
}

let ico_link = document.createElement('link');
ico_link.rel='icon';
ico_link.href=ico;
document.head.appendChild(ico_link); 