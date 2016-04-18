/* eslint-disable no-new, no-unused-expressions*/
import { expect } from 'chai';
import { Model, Collection, Unserializer } from '../src';

function getOneSimpleObject() {
  return {
    a: 'a',
    b: 'b',
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

class UnserializerMock extends Unserializer {
  run(obj) {
    return {
      c: obj.a,
      d: obj.b,
    };
  }
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


  it('Send a good unserializer', () => {
    const unserializer = new UnserializerMock();
    const testModel = new Model(
      getOneSimpleObject(),
      { unserializer }
    );
    expect(testModel).to.have.any.keys('c', 'd');
  });
});

describe('Collection', () => {
  it('Check the first argument, ModelClass, is obligatory', () => {
    expect(() => {
      new Collection();
    }).to.throw('ModelClass is not passed');
  });

  it('Call to constructor with no elements', () => {
    const collection = new Collection(Model);
    expect(collection.size()).to.be.equal(0);
  });

  it('Call to constructor with elements', () => {
    const collection = new Collection(Model, getTwoSimpleObject());
    expect(collection.size()).to.be.equal(2);
  });

  it('Add one element to empty collection', () => {
    const collection = new Collection(Model);
    collection.add(getOneSimpleObject());
    expect(collection.size()).to.be.equal(1);
  });

  it('Add two elements to empty collection', () => {
    const collection = new Collection(Model);
    collection.add(getTwoSimpleObject());
    expect(collection.size()).to.be.equal(2);
  });

  it('Search with results of non elements', () => {
    const collection = new Collection(Model);
    collection.add(getTwoSimpleObject());
    const resultSearch = collection.searchElements('key', 'nonvalue');
    expect(resultSearch).to.be.empty;
  });

  it('Search with on result found', () => {
    const collection = new Collection(Model);
    collection.add(getTwoSimpleObject());
    const resultSearch = collection.searchElements('c', 'c');
    expect(resultSearch).to.have.lengthOf(1);
  });

  it('Send options array to collections and expect error', () => {
    expect(() => {
      new Collection(Model, [], []);
    }).to.throw('options parameters has to be an object');
  });
});


describe('Unserializer', () => {
  it('Load with options', () => {
    const unserializer = new Unserializer({ a: 'a' });
    expect(unserializer).to.include.keys('options');
    const options = unserializer.options;
    expect(options).to.include.keys('a');
  });

  it('Send a unserializer parent objetc, check throw error', () => {
    expect(() => {
      new Model({}, {
        unserializer: new Unserializer(),
      });
    }).to.throw(
      'Override this functions in your class'
    );
  });
});
