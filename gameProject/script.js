const menu_background = document.getElementById('menu_bk_imgs');
const loading_bk = menu_background.querySelectorAll('.menu_bk_img');
let loading_bk_position = 0;

const loadingBackground = () => {
    if (loading_bk_position >= window.innerWidth) {
        loading_bk_position = 0;
    };
    loading_bk_position += 0.15;
    menu_background.style.left = `${loading_bk_position}px`;
    requestAnimationFrame(loadingBackground);
};

const loadingTrack = document.getElementById('loading_bar');
const loadingBar = document.getElementById('loading_progress');
const playButton = document.getElementById('play_button');
const startPage = document.getElementById('title_screen')
let loadingPercent = 0;

const loading_progress = () => {
    const add = setInterval(() => {
        if (loadingPercent >= 100) {
            clearInterval(add);
            setTimeout(loadingOpacity,500);
            return;
        }
        loadingPercent += 0.5;
        loadingBar.style.width = `${loadingPercent}%`;
    },5);
};

loadingOpacity = () => {
    loadingTrack.style.transition = 'opacity 0.5s';
    loadingTrack.style.opacity = '0';
    setTimeout(() => {
        loadingTrack.style.display = 'none';
        playButton.style.transition = 'opacity 0.5s';
        playButton.style.opacity = '1';
        setTimeout(() => {
            playButton.style.pointerEvents = 'auto';
            openWaitingRoom();
        },500);
    },500);
};

const waitingRoom = document.getElementById('waiting_room');
const arrows = document.getElementById('arrows');

const openWaitingRoom = () => {
    playButton.addEventListener('click', () => {
        startPage.style.transition = 'top 1s';
        startPage.style.top = '-50%';
        waitingRoom.style.transition = 'top 1s';
        waitingRoom.style.top = '0%';
    });
};openWaitingRoom();

const arrowLeft = document.getElementById('arrow_left');
const arrowRight = document.getElementById('arrow_right');
const waitingRoomSlide = document.getElementById('waiting_room_slide');
const footer = document.getElementById('footer');
const footerIcons = footer.querySelectorAll('div');
let waitingRoomLocation = 0, targetLocation, waitingRoomPage = 2, slideSpeed = 30, slideAnimating = false;

const waitingRoomSlideAni = () => {
    arrows.addEventListener('click', (e) => {
        if (e.target === arrowLeft && waitingRoomPage > 1) {
            --waitingRoomPage;
            slide();
        } else if (e.target === arrowRight && waitingRoomPage < 3) {
            ++waitingRoomPage;
            slide();
        };
    });

    footer.addEventListener('click', (e) => {
        if(e.target === footerIcons[0] || e.target === footerIcons[0].querySelector('img')) {
            waitingRoomPage = 1;
            slide();
        } else if(e.target === footerIcons[1] || e.target === footerIcons[1].querySelector('img')) {
            waitingRoomPage = 2;
            slide();
        } else if(e.target === footerIcons[2] || e.target === footerIcons[2].querySelector('img')) {
            waitingRoomPage = 3;
            slide();
        }
    });
};

const slide = () => {
    slideAnimating = true;
    targetLocation = slideTarget();
    
    const move = () => {
        const distance = Math.abs(waitingRoomLocation - targetLocation);

        if (distance <= slideSpeed) {
            waitingRoomLocation = targetLocation;
            waitingRoomSlide.style.transform = `translateX(${waitingRoomLocation}px)`;
            slideAnimating = false;
            return;
        }

        waitingRoomLocation += (targetLocation - waitingRoomLocation < 0 ? -slideSpeed : slideSpeed);
        waitingRoomSlide.style.transform = `translateX(${waitingRoomLocation}px)`;

        requestAnimationFrame(move);
    };
    move();

    window.addEventListener("resize", () => {
        if (slideAnimating) {
            targetLocation = slideTarget();
        } else {
            waitingRoomSlide.style.transform = `translateX(${slideTarget()}px)`
        }
    });
};

const showPages = document.querySelectorAll('#footer>div');

const slideTarget = () => {
    showPages.forEach(div => {
        if (div.id === "current_screen") {
            div.removeAttribute("id");
        }
    });
    
    if (waitingRoomPage === 1) {
        arrowLeft.style.opacity = '0.5';
        arrowLeft.style.cursor = 'auto';
        showPages[0].id = "current_screen";
        return window.innerWidth;
    } else if (waitingRoomPage === 2) {
        arrowLeft.style.opacity = '1';
        arrowRight.style.opacity = '1';
        arrowLeft.style.cursor = 'pointer';
        arrowRight.style.cursor = 'pointer';
        showPages[1].id = "current_screen";
        return 0;
    } else if (waitingRoomPage === 3) {
        arrowRight.style.opacity = '0.5';
        arrowRight.style.cursor = 'auto';
        showPages[2].id = "current_screen";
        return -window.innerWidth;
    }
};

const stageSelectPage = document.getElementById('stage_select');
const stageSelectButton = document.querySelectorAll('.stage_container > img:last-child');
const stageBox = document.getElementById('stage_box');
const header = document.getElementById("header");
const stageAllow = [true, false, false];

const stageSelect = () => {
    stageBox.addEventListener("click", (e) => {
        if (e.target === stageBox.querySelector('img:first-of-type')) {
            stageSelectPage.style.display = 'block';
        
            stageSelectButton.forEach((button, index) => {
                if (stageAllow[index]) {
                    button.style.cursor = "pointer";
                    button.src = './img/select_button.png';
                } else {
                    button.style.cursor = "auto";
                    button.src = './img/can_not.png';
                }
            });

            header.style.display = 'none';
            stageBox.style.display = 'none';
            footer.style.display = 'none';
            document.getElementById('arrows').style.display = 'none';


            stageSelectSlide();
            stageChoice();
        }
    });
};


const stageSelectSlide = () => {
    const selectSlide = document.getElementById('stage_select_slide');
    const selectArrows = document.getElementById('stage_arrows');
    const selectArrowLeft = document.getElementById('stage_arrow_left');
    const selectArrowRight = document.getElementById('stage_arrow_right');
    let selectPageTarget, selectPageLocation = 0;
    let selectPage = 1, selectAnimating = false, selectAniSpeed = 20;

    selectArrows.addEventListener('click', (e) => {
        if (e.target === selectArrowLeft && selectPage > 1) {
            --selectPage;
            selectSlideAni();
        } else if (e.target === selectArrowRight && selectPage < 3) {
            ++selectPage;
            selectSlideAni();
        }
    });

    const selectSlideAni = () => {
        selectAnimating = true;
        selectPageTarget = Target();

        const move = () => {
            const distance = Math.abs(selectPageLocation - selectPageTarget);

            if (distance <= selectAniSpeed) {
                selectPageLocation = selectPageTarget;
                selectSlide.style.transform = `translateX(${selectPageLocation}px)`;
                selectAnimating = false;
                return;
            }

            selectPageLocation += (selectPageTarget - selectPageLocation < 0 ? -selectAniSpeed : selectAniSpeed);
            selectSlide.style.transform = `translateX(${selectPageLocation}px)`;

            requestAnimationFrame(move);
        };
        move();
    };

    const Target = () => {
        let containerWidth = document.getElementById('stage_container').offsetWidth;
        if (selectPage === 1) {
            selectArrowLeft.style.opacity = '0.5';
            selectArrowLeft.style.cursor = 'auto';
            return 0;
        } else if (selectPage === 2) {
            selectArrowLeft.style.opacity = '1';
            selectArrowRight.style.opacity = '1';
            selectArrowLeft.style.cursor = 'pointer';
            selectArrowRight.style.cursor = 'pointer';
            return -containerWidth;
        } else if (selectPage === 3) {
            selectArrowRight.style.opacity = '0.5';
            selectArrowRight.style.cursor = 'auto';
            return -2 * containerWidth;
        }
    };
};

const stageChoice = () => {
    stageSelectButton.forEach((button) => {
        button.addEventListener('click', () => {
            const stageContainer = button.parentElement;
            const parentParent = document.querySelectorAll('.stage_container');
    
            const stageIndex = Array.from(parentParent).indexOf(stageContainer);
    
            if (stageAllow[stageIndex]) {
                
                stageBox.innerHTML = '';
    
    
                const h1 = stageContainer.querySelector('h1');
                const img = stageContainer.querySelector('img');
                const button = document.createElement('img');
                button.id = `${stageContainer.id}`;
                button.src = './img/play_button.png';
                button.alt = 'stage_button';
                button.draggable = false;

                header.style.display = 'flex';
                stageBox.style.display = 'flex';
                footer.style.display = 'flex';
                document.getElementById('arrows').style.display = 'flex';
    
                stageBox.appendChild(h1.cloneNode(true));
                stageBox.appendChild(img.cloneNode(true));
                stageBox.appendChild(button);

                stageSelectPage.style.display = 'none';
                arrows.style.zIndex = '10';
            } 
        });
    });
};

window.addEventListener('DOMContentLoaded', () => {
    loadingBackground();
    setTimeout(loading_progress,1000); 
    waitingRoomSlideAni();
    stageSelect();
});

