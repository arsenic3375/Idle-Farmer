class EventListener {
    constructor(type, listener) {
        this.type = type;
        this.listener = listener;
    }
}

class Element {
    constructor(id) {
        this.id = id;
        this.eventListeners = [];
    }

    addEventListener(type, listener) {
        this.eventListeners.push(new EventListener(type, listener));
    }

    removeEventListener(type, listener) {
        this.eventListeners.forEach((element) => {
            if(element.type === type && element.listener.toString() === listener.toString()) {
                this.eventListeners.splice(this.eventListeners.indexOf(element), 1)
            }
        });
    }

    dispatch(event) { 
        this.eventListeners.forEach((eventListener) => {
            if(eventListener.type === event.type) {
                eventListener.listener(event.detail); 
            }
        }); 
    }

    refresh() {
        if(document.getElementById(this.id) != null) {
            document.getElementById(this.id).replaceWith(this.renderHtmlElement());
        }
    }

    renderHtmlElement() {}   
}

class Text extends Element{
    constructor(id, type, text) {
        super(id);
        this.type = type;
        this.text = text;
    }

    renderHtmlElement() {
        let text = document.createElement(this.type);
        text.setAttribute("id", this.id);
        text.innerHTML = this.text;
        
        return text;
    }
}

class Button extends Element{
    constructor(id, text) {
        super(id);
        this.text = text;
    }

    renderHtmlElement() {
        let button = document.createElement("button");
        button.setAttribute("id", this.id);
        button.innerHTML = this.text;

        this.eventListeners.forEach((element) => {
                button.addEventListener(element.type, element.listener)
            }
        );
        return button;
    }
}

class Crop extends Element{
    constructor(id) {
        super(id);
        this.growthRate = 0;
        this.yeild = 0;
        this.maturity = 0;
        this.name = ""
        this.icon = "";
    }

    harvest() {
        this.maturity %= 100;
    }

    grow() {
        this.maturity += this.growthRate;
    }

    renderHtmlElement() {
        let crop = document.createElement("p");
        crop.setAttribute("id", this.id);
        crop.setAttribute("class", "crop");
        crop.style.fontSize = (100 + this.maturity) + "%";
        crop.innerHTML = this.icon;
        
        return crop;
    }
}

class Potato extends Crop {
    constructor(id) {
        super(id);
        this.growthRate = 5;
        this.yeild = 5;
        this.maturity = 0;
        this.name = "Potato"
        this.icon = "🥔";
    }
}

class Carrot extends Crop {
    constructor(id) {
        super(id);
        this.growthRate = 10;
        this.yeild = 1;
        this.maturity = 0;
        this.name = "Carrot"
        this.icon = "🥕";
    }
}

class Worker extends Element{
    constructor(id) {
        super(id);
    }
}

class Workers extends Element {
    constructor(id) {
        super(id);
        this.list = [];
    }
}

class Cell extends Element{
    constructor(id, parity){
        super(id);
        this.crop = new Carrot(this.id + "_crop");
        this.workersList
    
        this.parity = parity;

        this.openMenu = false;
        this.clicked = false
        this.addEventListener("click", () => {
            this.dispatch(new CustomEvent("closeCellMenu", {detail: {cell: this}}));
            this.clicked = !this.clicked;
            if(this.clicked) {
                this.dispatch(new CustomEvent("openCellMenu", {detail: {cell: this}}));
            }
            else {
                this.dispatch(new CustomEvent("closeCellMenu", {detail: {cell: this}}));
            }
        });
    }

    harvest() {
        this.crop.harvest();
        this.dispatch(new CustomEvent("harvest", {detail: {crop: this.crop}}));
    }

    grow() {
        if(this.crop.maturity >= 100) {
            this.harvest();
        }
        else {
            this.crop.grow();
            this.dispatch(new CustomEvent("grow", {detail: {cell: this}}));
        }
        this.crop.refresh();
    }

    plant(cropName) {
        let crop = null;
        switch(cropName) {
            case "Potato":
                crop = new Potato(this.id+"_crop");
                break;
            case "Carrot":
                crop = new Carrot(this.id+"_crop");
                break;
            default: 
                crop = new Crop(this.id + "_crop");
                break;
        }
        this.crop = crop;
        this.dispatch(new CustomEvent("plant", {detail: {crop: this.crop}}));

        this.crop.refresh();
        console.log("❗");
    }

    renderHtmlElement() {
        let td = document.createElement("td");
        td.setAttribute("id", this.id);
        td.setAttribute("class", "cell");
        td.appendChild(this.crop.renderHtmlElement());

        this.eventListeners.forEach((element) => {
                td.addEventListener(element.type, element.listener)
        });
        
        return td;
    }   
}

class Row extends Element{
    constructor(id, width, parity){
        super(id);
        this.width = width;
        this.col = [];
        this.totalCropCount = 0;
        this.parity = parity;

        for(let i = 0; i < this.width; i++) {
            this.addCell();
        }
    }

    openCellMenu(detail) {
        this.dispatch(new CustomEvent("openCellMenu", {detail}));
    }

    closeCellMenu(detail) {
        this.dispatch(new CustomEvent("closeCellMenu", {detail}));
    }

    harvest(detail) {
        this.totalCropCount+=detail.crop.yeild;
        this.dispatch(new CustomEvent("harvest", {detail}));
    }

    grow() {
        this.col.forEach((element) => {
            element.grow();
        });
    }

    plant(detail) {
        this.dispatch(new CustomEvent("plant", {detail}));   
        console.log("❗❗")
    }

    addCell() {
        this.col[this.col.length] = new Cell(this.id+"_col"+(this.col.length - 2), (this.col.length - 2)%2);

        this.col[this.col.length - 1].addEventListener("harvest", this.harvest.bind(this));
        this.col[this.col.length - 1].addEventListener("plant", this.plant.bind(this));

        this.col[this.col.length - 1].addEventListener("openCellMenu", this.openCellMenu.bind(this));
        this.col[this.col.length - 1].addEventListener("closeCellMenu", this.closeCellMenu.bind(this));

        this.refresh();
    }

    renderHtmlElement() {
        let tr = document.createElement("tr");
        tr.setAttribute("id", this.id);
        tr.setAttribute("class", "row");        

        for(let i = 0; i < this.col.length; i++) {
            let cell = this.col[i].renderHtmlElement();
            if((this.parity + this.col[i].parity)%2 == 0) {
                cell.classList.add("even");
            }
            else {
                cell.classList.add("odd");
            }
            tr.appendChild(cell);
        }

        return tr;
    }
}

class Table extends Element{
    constructor(id, width, height){
        super(id);
        this.width = width;
        this.height = height;
        this.row = [];
        this.totalCropCount = 0;

        for(let i = 0; i < this.height; i++) {
            this.addRow();
        }
    }

    openCellMenu(detail) {
        this.dispatch(new CustomEvent("openCellMenu", {detail}));
    }

    closeCellMenu(detail) {
        this.dispatch(new CustomEvent("closeCellMenu", {detail}));
    }

    harvest(detail) {
        this.totalCropCount+=detail.crop.yeild;
        this.dispatch(new CustomEvent("harvest", {detail}));
      
    }

    grow() {
        this.row.forEach((element) => {element.grow()});
    }

    plant(detail) {
        this.dispatch(new CustomEvent("plant", {detail}));   
        console.log("❗❗❗")
    }

    addRow() {
        this.row[this.row.length] = new Row(this.id+"_row"+(this.row.length - 2), this.width, (this.row.length - 2)%2);
        this.row[this.row.length - 1].addEventListener("harvest", this.harvest.bind(this));
        this.row[this.row.length - 1].addEventListener("plant", this.plant.bind(this));

        this.row[this.row.length - 1].addEventListener("openCellMenu", this.openCellMenu.bind(this));
        this.row[this.row.length - 1].addEventListener("closeCellMenu", this.closeCellMenu.bind(this));

        this.refresh();
    }

    addCol() {
        this.width++;
        for(let i = 0; i < this.row.length; i++) {
            this.row[i].addCell();
        }
    }

    renderHtmlElement() {
        let table = document.createElement("table");
        table.setAttribute("id", this.id);
        table.setAttribute("class", "table");        

        for(let i = 0; i < this.row.length; i++) {
            table.appendChild(this.row[i].renderHtmlElement());
        }

        return table;
    }
}

class Farm extends Element{
    constructor(id) {
        super(id);
        this.totalCropCount = 0;

        this.width = 1;
        this.height = 1; 

        this.name = new Text(this.id+"_name", "h2", this.id);
        this.totalCropCounter = new Text(this.id+"_totalCropCounter", "p", "Crops: "+this.totalCropCount);

        this.table = new Table(this.id+"_table", this.width, this.height);        
        this.table.addEventListener("harvest", this.harvest.bind(this));
        this.table.addEventListener("plant", this.plant.bind(this));

        this.table.addEventListener("openCellMenu", this.openCellMenu.bind(this));
        this.table.addEventListener("closeCellMenu", this.closeCellMenu.bind(this));

        this.growButton = new Button(this.id+"_growButton", "Grow");
        this.growButton.addEventListener("click", this.grow.bind(this));
        this.addRowButton = new Button(this.id+"_addRowButton", "Add Row");
        this.addRowButton.addEventListener("click", this.table.addRow.bind(this.table));
        this.addColButton = new Button(this.id+"_addColButton", "Add Col");
        this.addColButton.addEventListener("click", this.table.addCol.bind(this.table));

        //this.table.addRow();
        //this.table.addCol();
    }

    openCellMenu(detail) {
        this.dispatch(new CustomEvent("openCellMenu", {detail}));
    }

    closeCellMenu(detail) {
        this.dispatch(new CustomEvent("closeCellMenu", {detail}));
    }

    harvest(detail) {
        this.totalCropCount+=detail.crop.yeild;
        this.totalCropCounter.text = "Crops: "+this.totalCropCount;

        this.dispatch(new CustomEvent("harvest", {detail}));
    
        this.totalCropCounter.refresh();
    }

    grow() {
        this.table.grow();
    }

    plant(detail) {
        this.dispatch(new CustomEvent("plant", {detail}));  
        console.log("❗❗❗❗") 
    }

    renderHtmlElement() {
        let farm = document.createElement("div");
        farm.setAttribute("id", this.id);
        farm.setAttribute("class", "farm");

        farm.appendChild(this.name.renderHtmlElement());
        farm.appendChild(this.totalCropCounter.renderHtmlElement());
        farm.appendChild(this.table.renderHtmlElement());
        farm.appendChild(this.growButton.renderHtmlElement());
        farm.appendChild(this.addRowButton.renderHtmlElement());
        farm.appendChild(this.addColButton.renderHtmlElement());

        return farm;
    }
}

class Farms extends Element{
    constructor() {
        super("farms");
        this.totalCropCount = 0;
        this.count = 1;
        

        this.farms = []
        for(let i = 0; i < this.count; i++) {
            this.farms[i] = new Farm(this.id+"_farm"+i, this.store);
            this.farms[i].addEventListener("harvest", this.harvest.bind(this));
            this.farms[i].addEventListener("plant", this.plant.bind(this));

            this.farms[i].addEventListener("openCellMenu", this.openCellMenu.bind(this));
            this.farms[i].addEventListener("closeCellMenu", this.closeCellMenu.bind(this));
        }

        this.totalCropCounter = new Text(this.id+"totalCropCounter", "h1", "Crops: "+this.totalCropCount);
        this.growButton = new Button(this.id+"_growButton", "Grow");
        this.growButton.addEventListener("click", this.grow.bind(this));
        this.addFarmButton = new Button(this.id+"_addFarmButton", "Add Farm");
        this.addFarmButton.addEventListener("click", this.addFarm.bind(this));
    }

    openCellMenu(detail) {
        this.dispatch(new CustomEvent("openCellMenu", {detail}));
    }

    closeCellMenu(detail) {
        this.dispatch(new CustomEvent("closeCellMenu", {detail}));
    }

    harvest(detail) {
        this.totalCropCount += detail.crop.yeild;
        this.totalCropCounter.text = "Crops: "+this.totalCropCount;

        this.dispatch(new CustomEvent("harvest", {detail}));

        this.totalCropCounter.refresh();
    }

    grow() {
        for(let i = 0; i < this.count; i++) {
            this.farms[i].grow();
        }
    }

    plant(detail) {
        this.dispatch(new CustomEvent("plant", {detail}));
        console.log("❗❗❗❗❗")   
    }

    addFarm() {
        this.count++;
        this.farms[this.count-1] = new Farm(this.id+"_farm"+(this.count-1), this.store);

        this.farms[this.count-1].addEventListener("harvest", this.harvest.bind(this));
        this.farms[this.count-1].addEventListener("openCellMenu", this.openCellMenu.bind(this));
        this.farms[this.count-1].addEventListener("closeCellMenu", this.closeCellMenu.bind(this));

        this.refresh();
    }

    renderHtmlElement() {
        let farms = document.createElement("div");
        farms.setAttribute("id", this.id);
        farms.setAttribute("class", "farms");

        farms.appendChild(this.totalCropCounter.renderHtmlElement());
        
        for(let i = 0; i < this.count; i++) {
            farms.appendChild(this.farms[i].renderHtmlElement());
        }
        
        farms.appendChild(this.growButton.renderHtmlElement());
        farms.appendChild(this.addFarmButton.renderHtmlElement());

        return farms;
    }
}

class CellMenu extends Element{
    constructor() {
        super("cellMenu");

        this.cell = new Cell("");

        this.cropName = new Text(this.id+"_cropName", "p", this.cell.crop.name + ": ");
        this.cropMaturity = new Text(this.id+"_cropMaturity", "p", this.cell.crop.maturity + "%");

        this.information = [
            this.cropName,
            this.cropMaturity
        ];

        this.selection = [];
    }

    updateInformation() {
        this.cropName.text = this.cell.crop.name + ": ";
        this.cropMaturity.text = this.cell.crop.maturity + "%";
        this.refresh();
    }

    updateSelection(items) {
        this.selection = [];
        for(let i = 0; i < items.length; i++) {
            this.selection[i] = new Button(this.id + items[i] + "_" + items[i].name + "Button", items[i].icon);
            this.selection[i].addEventListener("click", () => {
                this.cell.plant(items[i].name);
                this.updateInformation();
            });
        }
        this.refresh();
    }

    open(detail) {
        this.cell = detail.cell;
        this.cell.addEventListener("grow", this.updateInformation.bind(this));
        this.cell.addEventListener("harvest", this.updateInformation.bind(this));

        this.updateInformation();
        document.body.appendChild(this.renderHtmlElement());
    }

    close(detail) {
        this.cell.removeEventListener("grow", this.updateInformation.bind(this));
        this.cell.removeEventListener("harvest", this.updateInformation.bind(this));

        if(document.getElementById(this.id) != null) {
            document.body.removeChild(document.getElementById(this.id));
        }
    }

    renderHtmlElement() {
        let cellMenu = document.createElement("div");
        cellMenu.setAttribute("id", this.id);
        cellMenu.setAttribute("class", "cellMenu");

        let information = document.createElement("div");
        information.setAttribute("id", this.id+"_information");
        this.information.forEach((element) => {
            information.appendChild(element.renderHtmlElement());
        });

        let selection = document.createElement("div");
        selection.setAttribute("id", this.id+"_selection");
        this.selection.forEach((element) => {
            selection.appendChild(element.renderHtmlElement());
        });

        cellMenu.appendChild(information);
        cellMenu.appendChild(selection);

        return cellMenu;
    }
}

//work in progress
class Store extends Element{
    constructor() {
        super("store");
        this.cropCount = 0;
        this.cropList = [new Potato(""), new Carrot("")];
        this.workerList = []

        this.cellMenu = new CellMenu();
    }

    openCellMenu(detail) {
        this.cellMenu.updateSelection(this.cropList);
        this.cellMenu.open(detail);
    }

    closeCellMenu(detail) {
        this.cellMenu.close(detail);
    }
}

class Game {
    constructor() {
        this.id = "game";

        this.cropCount = 0;
        this.cropList = [];
        this.farms = new Farms();
        this.store = new Store();

        this.farms.addEventListener("harvest", this.harvest.bind(this));
        this.farms.addEventListener("plant", this.plant.bind(this));

        this.farms.addEventListener("openCellMenu", this.store.openCellMenu.bind(this.store));
        this.farms.addEventListener("closeCellMenu", this.store.closeCellMenu.bind(this.store));


        this.title = new Text("title", "h1", "Idle Farmer");
        this.cropCounter = new Text("cropCounter", "h1", "Crops: "+this.cropCount);
    }

    harvest(detail) {
        this.store.cropCount+=detail.crop.yeild;
        this.cropCounter.text = "Crops: "+this.store.cropCount;
        this.cropCounter.refresh();
    }

    grow() {
        this.farms.grow();
    }

    plant(detail) {
        let i = this.cropList.findIndex((element) => element.id == detail.crop.id);
        if(i > -1){
            this.cropList[i] = detail.crop;
        }
        else{
            this.cropList.push(detail.crop);
        }
        console.log(this.cropList);
        console.log("❗❗❗❗❗❗");
    }

    renderHtmlElement() {
        let game = document.createElement("div");
        game.setAttribute("id", this.id);
        game.appendChild(this.title.renderHtmlElement());
        game.appendChild(this.cropCounter.renderHtmlElement());
        game.appendChild(this.farms.renderHtmlElement());

        return game;
    }
}

let game = new Game();
document.body.appendChild(game.renderHtmlElement());


//009409
//$K$#1ab1