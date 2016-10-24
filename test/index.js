/* eslint-disable no-new, no-unused-expressions*/
import { expect } from 'chai';
import { Model, Collection } from '../src';

function getOneSimpleObject() {
  return {
    a: 'a',
    b: 'b',
  };
}

function getAnotherSimpleObject() {
  return {
    g: 'g',
    h: 'h',
  };
}

function getTwoSimpleObject() {
  return [
    {
      c: 'c',
      d: 'd',
    },
    {
      e: 'e',
      f: 'f',
    },
  ];
}

function unserializerMock(obj) {
  return {
    c: obj.a,
    d: obj.b,
  };
}

function unserializerMockSecond(obj) {
  return {
    e: obj.c,
    f: obj.d,
  };
}

class ModelWithPrimaryKeyMock extends Model {
  static _primaryKey = 'a';
}

class CollectionWithModelMock extends Collection {
  static _ModelClass = ModelWithPrimaryKeyMock;
}

class CollectionWithSortMock extends Collection {
  static _sortFunction = (a, b) => a.a > b.a;
}

describe('Model', () => {
  it('Check if passed invalid argument to constructor throw error', () => {
    const error = 'First argument passed to constructor is invalid, ' +
        'expect object(key,value) or array';
    expect(() => {
      new Model();
    }).to.throw(
      error
    );
    expect(() => {
      new Model('hello');
    }).to.throw(
        error
    );
  });

  it('Set properties from object', () => {
    const test = new Model(getOneSimpleObject());
    expect(test).to.include.keys('a');
    expect(test).to.include.keys('b');
  });

  it('Check if options is non object throw an error', () => {
    expect(() => {
      new Model({}, []);
    }).to.throw(
      'options parameters has to be an object'
    );
  });

  it('Send a bad unserializer, not array', () => {
    expect(() => {
      new Model(
        getOneSimpleObject(),
        {
          unserializers: unserializerMock,
        }
      );
    }).to.throw(
      'Unserializer has to be an array'
    );
  });

  it('Send a good unserializer', () => {
    const testModel = new Model(
      getOneSimpleObject(),
      {
        unserializers: [
          unserializerMock,
        ],
      }
    );
    expect(testModel).to.have.any.keys('c', 'd');
  });


  it('Send a two unserializer', () => {
    const testModel = new Model(
      getOneSimpleObject(),
      {
        unserializers: [
          unserializerMock,
          unserializerMockSecond,
        ],
      }
    );
    expect(testModel).to.have.any.keys('e', 'f');
  });

  it('Check if not difine primary key, return uuid field', () => {
    const testModel = new Model(getOneSimpleObject());
    expect(testModel.getPrimaryKey()).is.equal('generateUuid');
  });

  it('Define model with primary key, check getPrimaryKey', () => {
    const testModel = new ModelWithPrimaryKeyMock(getOneSimpleObject());
    expect(testModel.getPrimaryKey()).is.equal('a');
  });

  it('Check generate uuid if not define primaryKey', () => {
    const testModel = new Model(getOneSimpleObject());
    expect(testModel.getKey()).to.not.be.a('undefined');
  });

  it('Check if the primaryKey is define, return correctly the value', () => {
    const testModel = new ModelWithPrimaryKeyMock(getOneSimpleObject());
    expect(testModel.getKey()).is.equal('a');
  });

  it('Check if define primaryKey and not pass in an object, send error', () => {
    expect(() => {
      new ModelWithPrimaryKeyMock(getAnotherSimpleObject());
    }).to.throw('The value for primary key is not defined');
  });
  it('toJson', () => {
    const testModel = new Model(getOneSimpleObject());
    expect(JSON.stringify(testModel)).is.equals(JSON.stringify(getOneSimpleObject()));
  });

  it('If send uuid and don´t change primary key, save the uuid field', () => {
    const simpleObject = getOneSimpleObject();
    simpleObject.uuid = 'test_uuid';
    const testModel = new Model(simpleObject);

    expect(testModel.uuid).is.equals('test_uuid');
  });
});

describe('Collection', () => {
  it('Call to constructor with elements is non array, check throw', () => {
    expect(() => {
      new Collection({});
    }).to.throw('Elements has to be an array');
  });

  it('Call to constructor with no elements', () => {
    const collection = new Collection();
    expect(collection.size()).to.be.equal(0);
  });

  it('Call to constructor with elements', () => {
    const collection = new Collection(getTwoSimpleObject());
    expect(collection.size()).to.be.equal(2);
  });

  it('Add one element to empty collection', () => {
    const collection = new Collection();
    collection.add(getOneSimpleObject());
    expect(collection.size()).to.be.equal(1);
  });

  it('Add two elements to empty collection', () => {
    const collection = new Collection();
    collection.add(getTwoSimpleObject());
    expect(collection.size()).to.be.equal(2);
  });

  it('Search with results of non elements', () => {
    const collection = new Collection();
    collection.add(getTwoSimpleObject());
    const resultSearch = collection.searchElements('key', 'nonvalue');
    expect(resultSearch).to.be.empty;
  });

  it('Search with result found', () => {
    const collection = new Collection();
    collection.add(getTwoSimpleObject());
    const resultSearch = collection.searchElements('c', 'c');
    expect(resultSearch).to.have.lengthOf(1);
  });

  it('Send options array to collections and expect error', () => {
    expect(() => {
      new Collection([], []);
    }).to.throw('options parameters has to be an object');
  });

  it('Search one element by key', () => {
    const collection = new CollectionWithModelMock(
      [getOneSimpleObject()]
    );
    const resultSearch = collection.searchElement('a');
    expect(resultSearch).to.have.includes.keys('a', 'b');
  });

  it('Search one element by key and no results found', () => {
    const collection = new CollectionWithModelMock(
      [getOneSimpleObject()]
    );
    const resultSearch = collection.searchElement('x');
    expect(resultSearch).to.be.a('undefined');
  });

  it('Clear collection', () => {
    const collection = new Collection(getTwoSimpleObject());
    collection.clear();
    expect(collection.size()).to.be.equal(0);
  });

  it('Remove element', () => {
    const collection = new CollectionWithModelMock(
      [getOneSimpleObject()]
    );
    const deleted = collection.delete('a');
    expect(deleted).to.be.true;
    expect(collection.size()).to.be.equal(0);
  });

  it('Check if element exists', () => {
    const collection = new CollectionWithModelMock(
      [getOneSimpleObject()]
    );
    expect(collection.has('a')).to.be.true;
  });

  it('Check if element not exists', () => {
    const collection = new CollectionWithModelMock(
      [getOneSimpleObject()]
    );
    expect(collection.has('x')).to.be.false;
  });

  it('Iterate over collection', () => {
    const collection = new Collection(getTwoSimpleObject());
    let cont = 0;
    for (const model of collection) {
      expect(model.constructor).to.be.equal(Model);
      expect(model).to.not.be.an('undefined');
      cont++;
    }
    expect(cont).to.be.equal(2);
  });

  it('Iterate over collection with custom collection', () => {
    const collection = new CollectionWithModelMock([getOneSimpleObject()]);
    let cont = 0;
    for (const model of collection) {
      expect(model.constructor).to.be.equal(ModelWithPrimaryKeyMock);
      expect(model).to.not.be.an('undefined');
      cont++;
    }
    expect(cont).to.be.equal(1);
  });

  it('If pass options to collections, this pass options to model', () => {
    const collection = new CollectionWithModelMock(
      [getOneSimpleObject()],
      {
        newOption: 'option',
      }
    );
    expect(
      collection
        .searchElement('a')
        ._options
        .newOption
    ).to.be.equal('option');
  });
  it('Check map collection', () => {
    const collection = new Collection(getTwoSimpleObject());
    const arrayOfIndex = [];
    const collectionArray = collection.map((element, index) => {
      arrayOfIndex.push(index);
      return element;
    });

    expect(arrayOfIndex).to.has.length(2);
    expect(arrayOfIndex).to.have.members([0, 1]);
    expect(collectionArray).to.be.a('array');
    expect(collectionArray[0]).to.have.includes.keys('c', 'd');
  });
  it('Get first element of collection', () => {
    const collection = new Collection(getTwoSimpleObject());

    expect(collection.getFirst()).to.have.includes.keys('c', 'd');
  });
  it('Get last element of collection', () => {
    const collection = new Collection(getTwoSimpleObject());

    expect(collection.getLast()).to.have.includes.keys('e', 'f');
  });

  it('Add method to array', () => {
    const collection = new Collection(getTwoSimpleObject());

    expect(collection.toArray()).to.be.an('array').with.length(2);
  });

  it('Iterator over', () => {
    const collection = new Collection(getTwoSimpleObject());

    for (const element of collection.iteratorOver()) {
      expect(element.constructor).to.be.equal(Model);
    }
  });

  it('Get Iterator values', () => {
    const collection = new Collection(getTwoSimpleObject());

    const iterator = collection.getIterator();

    expect(iterator.next().value).to.have.includes.keys('c', 'd');
    expect(iterator.next().value).to.have.includes.keys('e', 'f');
  });

  it('Get iterator entries', () => {
    const collection = new Collection(getTwoSimpleObject());
    const iterator = collection.getIteratorEntries();

    expect(iterator.next().value[1]).to.have.includes.keys('c', 'd');
    expect(iterator.next().value[1]).to.have.includes.keys('e', 'f');
  });

  it('toJSON', () => {
    const collection = new Collection(getTwoSimpleObject());
    expect(JSON.stringify(collection)).is.equal(JSON.stringify(getTwoSimpleObject()));
  });

  it('pre sort option', () => {
    const orderFunction = (a, b) => a.a > b.a;

    const arrayObject = [
      {
        a: 2,
      },
      {
        a: 1,
      },
      {
        a: 3,
      },
    ];

    const collection = new Collection(arrayObject, {
      sortBy: orderFunction,
    });
    expect(collection.getFirst()).to.be.deep.equal({
      a: 1,
    });
    expect(collection.getLast()).to.be.deep.equal({
      a: 3,
    });
  });

  it('Pre sort in with static function in collection', () => {
    const arrayObject = [
      {
        a: 2,
      },
      {
        a: 1,
      },
      {
        a: 3,
      },
    ];
    const collection = new CollectionWithSortMock(arrayObject);
    expect(collection.getFirst()).to.be.deep.equal({
      a: 1,
    });
    expect(collection.getLast()).to.be.deep.equal({
      a: 3,
    });
  });
});

describe('Especify the type of fields', () => {
  class WithTypePropertyModel extends Model {
    static _types = {
      typeModel: ModelWithPrimaryKeyMock,
    };
  }

  it('Specify that one property is an another model', () => {
    const propertyTypeModel = new WithTypePropertyModel({
      a: 'a',
      typeModel: getOneSimpleObject(),
    });
    expect(propertyTypeModel.typeModel.constructor).to.be.equal(ModelWithPrimaryKeyMock);
  });

  it('Send a property that is already the correct type', () => {
    const objModel = new ModelWithPrimaryKeyMock(getOneSimpleObject());
    const propertyTypeModel = new WithTypePropertyModel({
      a: 'a',
      typeModel: objModel,
    });
    expect(propertyTypeModel.typeModel.constructor).to.be.equal(ModelWithPrimaryKeyMock);
  });
});
