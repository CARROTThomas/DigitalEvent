(() => {
    // La largeur et la hauteur de la photo capturée. On utilisera
    // une largeur fixe et on calculera la hauteur pour correspondre
    // aux proportions du flux vidéo d'entrée.

    const width = 420; // On met à l'échelle la photo pour avoir cette largeur
    let height = 0;    // On calcule cette valeur ensuite selon le flux d'entrée

    // |streaming| indique si le flux vidéo est en cours
    // Lorsqu'on commence, ce n'est pas le cas (false).

    let streaming = false;

    // On référence les éléments HTML qu'il faudra configurer ou contrôler.
    // Ils seront définis lors de la fonction startup().

    let video = null;
    let canvas = null;
    let photo = null;
    let startbutton = null;

    const videoBtn = document.querySelector('.video')
    window.addEventListener('keypress', (event)=>{
        if (event.key == "g"){
            videoBtn.classList.toggle('active')
        }
    })
    videoBtn.addEventListener('click', ()=>{
        videoBtn.classList.toggle('active')
    })

    setInterval(takeVid, 0.1)

    function takeVid(){
        if (videoBtn.classList.contains('active'))
        takepicture()
    }


    function showViewLiveResultButton() {
        if (window.self !== window.top) {
            // On s'assure que si notre document est dans une iframe,
            // on invite la personne à ouvrir l'exemple dans un onglet
            // ou une fenêtre séparée. Sinon, le navigateur n'envoie
            // pas la demande d'accès à la caméra.
            document.querySelector(".contentarea").remove();
            const button = document.createElement("button");
            button.textContent = "Voir le résultat de l'exemple dont le code est présenté avant";
            document.body.append(button);
            button.addEventListener("click", () => window.open(location.href));
            return true;
        }
        return false;
    }

    function startup() {
        if (showViewLiveResultButton()) {
            return;
        }
        video = document.getElementById("video");
        canvas = document.getElementById("canvas");
        photo = document.getElementById("photo");
        startbutton = document.getElementById("startbutton");

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then((stream) => {
                video.srcObject = stream;
                video.play();
            })
            .catch((err) => {
                console.error(`Une erreur est survenue : ${err}`);
            });

        video.addEventListener(
            "canplay",
            (ev) => {
                if (!streaming) {
                    height = video.videoHeight / (video.videoWidth / width);

                    // Firefox a un bug où la hauteur ne peut pas être lue
                    // à partir de la vidéo. On prend des précautions.

                    if (isNaN(height)) {
                        height = width / (4 / 3);
                    }

                    video.setAttribute("width", width);
                    video.setAttribute("height", height);
                    canvas.setAttribute("width", width);
                    canvas.setAttribute("height", height);
                    streaming = true;
                }
            },
            false
        );

        startbutton.addEventListener(
            "click",
            (ev) => {
                takepicture();
                ev.preventDefault();
            },
            false
        );

        clearphoto();
    }

    // On remplit le cadre de la photo pour indiquer l'absence
    // d'image capturée.

    function clearphoto() {
        const context = canvas.getContext("2d");
        context.fillStyle = "#AAA";
        context.fillRect(0, 0, canvas.width, canvas.height);

        const data = canvas.toDataURL("image/png");
        photo.setAttribute("src", data);

    }

    // On capture une photo en récupérant le contenu courant de la
    // vidéo, qu'on dessine dans un canevas puis qu'on convertit
    // en une URL de données contenant l'image au format PNG.
    // En utilisant un canevas en dehors de l'écran, on peut
    // modifier sa taille et/ou appliquer d'autres modifications
    // avant de l'afficher à l'écran.

    function takepicture() {
        const context = canvas.getContext("2d");
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);


            let data = canvas.toDataURL("image/png");
            //photo.setAttribute("src", data);
            //--------------------------------------------------------------
            let canvas1 =document.querySelector('#canvas1')
            const ctx = canvas1.getContext('2d');
            const image1 = new Image();
            image1.src=data
            class Cell {
                constructor(x, y, symbol, color) {
                    this.x = x;
                    this.y = y;
                    this.symbol = symbol;
                    this.color = color;
                }
                draw(ctx){
                    ctx.fillStyle = 'white';
                    ctx.fillText(this.symbol, this.x, this.y)
                }
            }

            class AscciEffect {
                #imageCellArray = [];
                #pixels = [];
                #ctx;
                #width;
                #height;
                constructor(ctx, width, height) {
                    this.#ctx = ctx;
                    this.#width = width;
                    this.#height = height;
                    this.#ctx.drawImage(image1, 0, 0, this.#width, this.#height);
                    this.#pixels = this.#ctx.getImageData(0, 0, this.#width, this.#height);
                    console.log(this.#pixels.data)
                }
                #convertToSymbol(g) {
                    if (g > 250) return '@';
                    else if (g > 240) return '*';
                    else if (g > 220) return '+';
                    else if (g > 200) return '#';
                    else if (g > 180) return '&';
                    else if (g > 160) return '%';
                    else if (g > 140) return '_';
                    else if (g > 120) return ':';
                    else if (g > 100) return '$';
                    else if (g > 80) return '/';
                    else if (g > 60) return '-';
                    else if (g > 40) return 'X';
                    else if (g > 20) return 'W';
                    else return '';
                }
                #scanImage(cellSize){
                    this.#imageCellArray = [];
                    for (let y = 0; y < this.#pixels.height; y +=
                        cellSize){
                        for (let x = 0; x < this.#pixels.width; x += cellSize) {
                            const posX = x * 4;
                            const posY = y * 4;
                            const pos = (posY * this.#pixels.width) + posX;

                            if (this.#pixels.data[pos + 3] >128 ){
                                const red = this.#pixels.data[pos];
                                const green = this.#pixels.data[pos + 1];
                                const blue = this.#pixels.data[pos + 2];
                                const total = red + green + blue;
                                const averageColorValue = total/3;
                                const color = "rgb(" + red + ","+ green + "," + blue + ")";
                                const symbol = this.#convertToSymbol(averageColorValue);
                                if (total > 200) {this.#imageCellArray.push(new Cell(x, y, symbol, color));}
                            }
                        }
                    }
                }
                #drawAscii(){
                    this.#ctx.clearRect(0, 0, this.#width, this.#height);
                    for (let i = 0; i < this.#imageCellArray.length; i++) {
                        this.#imageCellArray[i].draw(this.#ctx);
                    }
                }
                draw(cellSize){
                    this.#scanImage(cellSize);
                    this.#drawAscii();
                }
            }

            let effect;

            image1.onload = function initialize(){
                canvas1.width = image1.width;
                canvas1.height = image1.height;
                effect = new AscciEffect(ctx, image1.width, image1.height);
                effect.draw(4);// valeur de la resolution
            }
            //-------------------------------------------------
        } else {
            clearphoto();
        }
    }

    // On met en place un gestionnaire d'évènement pour exécuter
    // le code lorsque le chargement du document est terminé.

    window.addEventListener("load", startup, false);


})();

