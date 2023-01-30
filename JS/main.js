(() => {

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


    // lancer un script
    window.addEventListener('keypress', (event)=>{
        if (event.key == " "){
            takepicture();
            divCamera.classList.add("display")
            divCameraResult.classList.add("displayBlock")
            console.log('script à lancé')
        }
    })

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
        startbutton = document.getElementById("startbutton");
        divCamera = document.querySelector('.camera')
        divCameraResult = document.querySelector('.output')

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

        startbutton.addEventListener("click", () => {
                takepicture();
                divCamera.classList.add("display")
                divCameraResult.classList.add("displayBlock")
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

        sourceImage = canvas.toDataURL("image/png");
        //photo.setAttribute("src", sourceImage);
    }

    function takepicture() {
        const context = canvas.getContext("2d");
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);


            let data = canvas.toDataURL("image/png");
            //photo.setAttribute("src", data);
            //--------------------------------------------------------------
            let canvas1 = document.querySelector('#canvas1')
            const ctx = canvas1.getContext('2d');
            const image1 = new Image();
            image1.src=data
            //console.log(image1.src) // ################## Lien de la base64
            class Cell {
                constructor(x, y, symbol) {
                    this.x = x;
                    this.y = y;
                    this.symbol = symbol;
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
                    //console.log(this.#pixels.data) // ################## Grille
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

            let effect; // ################## objet = tableau => tableau = coordonnées, symbol

            image1.onload = function initialize(){
                canvas1.width = image1.width;
                canvas1.height = image1.height;
                effect = new AscciEffect(ctx, image1.width, image1.height);
                effect.draw(5);
                // valeur de la resolution
                // (4 ou 5 pour fond noir et caractère blanc
                // (5 ou 6 pour fond blanc et caractère noir)
            }

            const {
                PDFDocument,
                StandardFonts,
                rgb
            } = PDFLib

            async function createPdf() {
                // Create a new PDFDocument
                const pdfDoc = await PDFDocument.create()

                // Embed the Times Roman font
                const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

                // Add a blank page to the document
                const page = pdfDoc.addPage()

                // Get the width and height of the page
                const {
                    width,
                    height
                } = page.getSize()

                // Draw a string of text toward the top of the page
                const fontSize = 30

                const template = document.querySelector('.template')

                page.drawText(truc(), {
                    x: 50,
                    y: height - 4 * fontSize,
                    size: fontSize,
                    font: timesRomanFont,
                    color: rgb(0, 0.53, 0.71),
                })

                // Serialize the PDFDocument to bytes (a Uint8Array)
                const pdfBytes = await pdfDoc.save()

                // Trigger the browser to download the PDF document
                download(pdfBytes, "bureauPdf.pdf", "Bureau");
            }

            setTimeout(()=>{
                createPdf()
            }, 2000)
            //-------------------------------------------------
        } else {
            clearphoto();
        }
    }
    window.addEventListener("load", startup, false);

})();






async function truc(){
    return await html2canvas(document.getElementById("canvas1"), {
        allowTaint: true,
        useCORS: true,
    })
        .then(function (canvas) {
            // It will return a canvas element
            let image = canvas.toDataURL("image/png", 0.5);
            let bidule = new Image()
            bidule.src=image

            console.log(bidule)
            return bidule
        })
        .catch((e) => {
            // Handle errors
            console.log(e);
        });
}




