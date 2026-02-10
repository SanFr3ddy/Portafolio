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
const codeCloseButtons = document.querySelectorAll('[data-code-close]');


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
    if(!codeModal || !codeModalCode){
        return;
    }

    codeModal.classList.add('is-open');
    codeModal.setAttribute('aria-hidden', 'false');
    codeModalCode.textContent = 'Cargando...';

    if(codeModalTitle){
        codeModalTitle.textContent = titleText ? `Codigo HTML - ${titleText}` : 'Codigo HTML';
    }

    fetch(filePath)
        .then(function(response){
            if(!response.ok){
                throw new Error('No se pudo cargar el archivo');
            }
            return response.text();
        })
        .then(function(text){
            codeModalCode.textContent = text;
        })
        .catch(function(){
            codeModalCode.textContent = 'No se pudo cargar el archivo.';
        });
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