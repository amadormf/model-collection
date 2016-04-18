/* eslint-disable no-new, no-unused-expressions*/
import { expect } from 'chai';
import { Model, Collection } from '../src';

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
});
