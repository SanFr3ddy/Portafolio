const menuToggler = document.querySelector('.menu-toggler');
const sideBar = document.querySelector('.side-bar');

const navItemLinks = document.querySelectorAll('.nav li a');
const pages = document.querySelectorAll('.page');

const filterBtn = document.querySelectorAll('.filter-item');
const itemCategory = document.querySelectorAll('.item-category');

const codeModal = document.querySelector('.code-modal');
const codeModalCode = document.querySelector('#code-modal-code');
const codeModalTitle = document.querySelector('#code-modal-title');
const codeButtons = document.querySelectorAll('[data-code-file]');
const demoButtons = document.querySelectorAll('[data-demo-file]');
const codeCloseButtons = document.querySelectorAll('[data-code-close]');
const codeModalBody = document.querySelector('#code-modal-body');


menuToggler.addEventListener('click', function(){
    sideBar.classList.toggle('active');
})


for(let i = 0; i < navItemLinks.length; i++){
    navItemLinks[i].addEventListener('click', function(){

        const itemLinkText = this.textContent.toLowerCase();

        for(let i = 0; i < pages.length; i++){
            if(pages[i].classList.contains(itemLinkText)){
                pages[i].classList.add('active');
                navItemLinks[i].classList.add('active');
            }else{
                pages[i].classList.remove('active');
                navItemLinks[i].classList.remove('active');
            }
        }
    });
}


for(let i = 0; i < filterBtn.length; i++){
    filterBtn[i].addEventListener('click', function(){
        for(let i = 0; i < filterBtn.length; i++){
            filterBtn[i].classList.remove('active');
        }
        this.classList.add('active');

        for(let i = 0; i < itemCategory.length; i++){
            const itemCategoryText = itemCategory[i].textContent;
            switch(this.textContent){
                case itemCategoryText:
                    itemCategory[i].parentElement.classList.add('active');
                    break;
                case 'All':
                    itemCategory[i].parentElement.classList.add('active');
                    break;
                default:
                    itemCategory[i].parentElement.classList.remove('active');
            }
        }
    });
}


function openCodeModal(filePath, titleText){
    if(!codeModal || !codeModalBody || !codeModalCode){
        return;
    }
    codeModal.classList.add('is-open');
    codeModal.setAttribute('aria-hidden', 'false');
    codeModalTitle.textContent = titleText ? `Código fuente - ${titleText}` : 'Código fuente';
    codeModalBody.scrollTop = 0;
    codeModalBody.style.padding = '0';
    codeModalBody.style.background = '#181c20';
    codeModalBody.style.minHeight = '40vh';
    codeModalBody.style.display = 'block';
    codeModalCode.style.display = 'block';
    codeModalCode.innerHTML = 'Cargando...';

    fetch(filePath)
        .then(function(response){
            if(!response.ok){
                throw new Error('No se pudo cargar el archivo');
            }
            return response.text();
        })
        .then(function(text){
            codeModalCode.innerHTML = escapeHtml(text);
            if(window.hljs) window.hljs.highlightElement(codeModalCode);
        })
        .catch(function(){
            codeModalCode.innerHTML = `<span style='color:#f66'>No se pudo cargar el archivo.</span>`;
        });
}

function openDemoModal(demoPath, titleText){
    if(!codeModal || !codeModalBody){
        return;
    }
    codeModal.classList.add('is-open');
    codeModal.setAttribute('aria-hidden', 'false');
    codeModalTitle.textContent = titleText ? `Demo - ${titleText}` : 'Demo';
    codeModalBody.innerHTML = `<iframe src="${demoPath}" style="width:100%;height:70vh;border:none;background:#222;"></iframe>`;
}

function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function closeCodeModal(){
    if(!codeModal){
        return;
    }
    codeModal.classList.remove('is-open');
    codeModal.setAttribute('aria-hidden', 'true');
}


if(codeButtons.length){
    for(let i = 0; i < codeButtons.length; i++){
        codeButtons[i].addEventListener('click', function(){
            const filePath = this.getAttribute('data-code-file');
            const cardTitle = this.closest('.trabajo-card');
            const titleText = cardTitle ? cardTitle.querySelector('h3')?.textContent : '';
            if(filePath){
                openCodeModal(filePath, titleText || '');
            }
        });
    }
}

if(demoButtons.length){
    for(let i = 0; i < demoButtons.length; i++){
        demoButtons[i].addEventListener('click', function(){
            const demoPath = this.getAttribute('data-demo-file');
            const cardTitle = this.closest('.trabajo-card');
            const titleText = cardTitle ? cardTitle.querySelector('h3')?.textContent : '';
            if(demoPath){
                openDemoModal(demoPath, titleText || '');
            }
        });
    }
}

if(codeCloseButtons.length){
    for(let i = 0; i < codeCloseButtons.length; i++){
        codeCloseButtons[i].addEventListener('click', closeCodeModal);
    }
}

document.addEventListener('keydown', function(event){
    if(event.key === 'Escape' && codeModal && codeModal.classList.contains('is-open')){
        closeCodeModal();
    }
});