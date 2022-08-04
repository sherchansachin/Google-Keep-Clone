class App {
    constructor(){
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.title = '';
        this.text = '';
        this.id = '';

        // DOM elements
        this.$placeholder = document.querySelector("#placeholder");
        this.$form = document.querySelector('#form');
        this.$noteTitle = document.querySelector("#note-title");
        this.$noteText = document.querySelector("#note-text");
        this.$formButtons = document.querySelector("#form-buttons");
        this.$notes = document.querySelector("#notes")
        this.$closeButton = document.querySelector("#form-close-button");
        this.$modal = document.querySelector(".modal");
        this.$modalTitle = document.querySelector(".modal-title");
        this.$modalText = document.querySelector(".modal-text");
        this.$modalCloseButton = document.querySelector(".modal-close-button");
        this.$colorTooltip = document.querySelector("#color-tooltip");

        this.render();
        this.addEventListeners();
    }

    // click event
    addEventListeners(){
        document.body.addEventListener('click', event => {
            this.handleFormClick(event);
            this.selectNote(event);
            this.openModal(event);
            this.deleteNote(event);
        });

        // mouse over event for changing colors
        document.body.addEventListener('mouseover', event =>{
            this.openTooltip(event);
        }); 

        document.body.addEventListener('mouseout', event =>{
            this.closeTooltip(event);
        }); 

        this.$colorTooltip.addEventListener('mouseover', function() {
            this.style.display = 'flex';
        });

        this.$colorTooltip.addEventListener('mouseout', function() {
            this.style.display = 'none';
        });

        this.$colorTooltip.addEventListener('click', event => {
            const color = event.target.dataset.color;
            if(color) {
                this.editNoteColor(color);
            }
        })

        // listen for a submit event
        this.$form.addEventListener('submit', event =>{
            event.preventDefault();
            // get the note title and text value
            const title = this.$noteTitle.value;
            const text = this.$noteText.value;

            // check condition whether smthing is written or not
            const hasNote = title || text;

            if(hasNote) {
                this.addNote({ title: title, text: text });
            }

        });

        // close form 
        this.$closeButton.addEventListener('click', event =>{
            // https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation
            event.stopPropagation();
            this.closeForm();
        })

        this.$modalCloseButton.addEventListener('click', event =>{
            this.closeModal(event);
        })

        

    }

    // if form clicked; open, add and close note form
    handleFormClick(event){
        const idFormClicked = this.$form.contains(event.target);

        const title = this.$noteTitle.value;
        const text = this.$noteText.value;
        const hasNote = title || text;

        if (idFormClicked) {
            // open the form
            this.openForm();
        } else if(hasNote){
            this.addNote({title, text});
        }else {
            //close the form
            this.closeForm();
        }
    }

    openForm(){
        this.$form.classList.add('form-open');
        this.$noteTitle.style.display = "block";
        this.$formButtons.style.display = "block";
    }

    closeForm(){
        this.$form.classList.add('form-open');
        this.$noteTitle.style.display = "none";
        this.$formButtons.style.display = "none";
        this.$noteTitle.value = "";
        this.$noteText.value = "";
    }

    // open modal function (edit notes)
    openModal(event) {
        if(event.target.matches('.toolbar-delete')) return;
        if (event.target.closest('.note')){
            this.$modal.classList.toggle('open-modal');
            this.$modalTitle.value= this.title;
            this.$modalText.value= this.text;
        }
    }

    closeModal(event){
        // close modal here plus edit here
        this.editNote();
        this.$modal.classList.toggle('open-modal');
    }

    openTooltip(event){
        if (!event.target.matches('.toolbar-color')) return;
        this.id = event.target.dataset.id;
        //  ref: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
        const noteCoords = event.target.getBoundingClientRect();
        const horizontal = noteCoords.left;
        const vertical =  window.scrollY - 22;
        this.$colorTooltip.style.transform = `translate(${horizontal}px, ${vertical}px)`;
        this.$colorTooltip.style.display = 'flex';
    }

    closeTooltip(event){
        if (!event.target.matches('.toolbar-color')) return;
        this.$colorTooltip.style.display = 'none';
    }


    addNote({ title, text }){
        const newNote = {
            title,
            text,
            color: 'white',
            id: this.notes.length > 0 ? this.notes[this.notes.length - 1].id + 1 : 1 
        };
        // mutate array
        this.notes = [...this.notes, newNote];
        this.render();

        // after displaying, close the form and clear input (note title and text)
        this.closeForm();
    }

    editNote() {
        const title = this.$modalTitle.value;
        const text = this.$modalText.value;

        // transform and keep the array at same length
        this.notes = this.notes.map(note =>
            note.id === Number(this.id) ? {...note, title, text} : note
        );
        this.render();
    }

    editNoteColor(color){
        this.notes = this.notes.map(note =>
            note.id === Number(this.id) ? {...note, color} : note
        );
        this.render();
    }

    selectNote(event){
        const $selectedNote = event.target.closest('.note');
        if(!$selectedNote) return;
        // grab the children off DOM
        const [$noteTitle, $noteText] = $selectedNote.children;
        this.title = $noteTitle.innerHTML;
        this.text = $noteText.innerHTML;
        this.id = $selectedNote.dataset.id;
    }
    
    // delete note
    deleteNote(event){
        event.stopPropagation();
        if (!event.target.matches('.toolbar-delete')) return;
        const id = event.target.dataset.id;
        this.notes = this.notes.filter(note => note.id !== Number(id));
        this.render();
    }

    render() {
        this.saveNotes();
        this.displayNotes();
    }

    // save to localStorage
    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes))
    }


    // display notes
    displayNotes() {
        // check if any notes
        const hasNotes = this.notes.length > 0;
        if(hasNotes){
            // take placeholder element, 
            this.$placeholder.style.display = 'none';
        }
        this.$placeholder.style.display = hasNotes ? 'none' : 'flex';

        this.$notes.innerHTML = this.notes.map(note => `
        <div style="background: ${note.color};" class="note" data-id="${note.id}">
          <div class="${note.title && 'note-title'}">${note.title}</div>
          <div class="note-text">${note.text}</div>
          <div class="toolbar-container">
            <div class="toolbar">
              <img class="toolbar-color" data-id=${note.id} src="img/paint-palette.png">
              <img class="toolbar-delete" data-id=${note.id} src="img/filled-trash.png">
            </div>
          </div>
        </div>
     `).join("");
    }
}

// instansiation
new App()