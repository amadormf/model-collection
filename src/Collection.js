export default class Collection {
  constructor(ModelClass, objects){
    if(!ModelClass){
      throw new Error('ModelClass is not passed')
    }

    this.Model = ModelClass;
    this.set = new Set();
    if(objects && objects.length > 0){
      this._addArray(objects);
    }
  }

  add(element){
    if( Object.prototype.toString.call( element ) === '[object Array]' ) {
      this._addArray(element);
    }
    else{
      this._addOneElement(element);
    }
    return this;
  }

  size(){
    return this.set.size;
  }

  searchElements(field, value){
    const items = [];
    for (let item of this.set){
      if(item[field] === value){
        items.push(item);
      }
    }
    return items;
  }

  _addOneElement(element){
    if(element instanceof this.Model){
      this.set.add(element);
    }
    else{
      this.set.add(new this.Model(element));
    }
  }

  _addArray(elements){
    for(let i = 0; i < elements.length; ++i){
      this._addOneElement(new this.Model(elements[i]));
    }
  }



}
