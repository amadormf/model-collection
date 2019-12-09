/* eslint-disable no-new, no-unused-expressions*/
import { expect } from 'chai';
import { Model, Collection } from '../src';
import {
  getOneSimpleObject, getTwoSimpleObject, CollectionWithSortMock,
  ModelWithPrimaryKeyMock, CollectionWithModelMock,
} from './mocks';

describe('Collection', () => {
  it('Call to constructor with elements is non array, check throw', () => {
    expect(() => {
      new Collection({});
    }).to.throw('Elements has to be an array');
  });

  it('Call with null parameter and initialize with 0 elements', () => {
    const collection = new Collection(null);
    expect(collection.size()).to.be.equal(0);
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

  it('Check filter collection', () => {
    const collection = new Collection(getTwoSimpleObject());

    const filteredCollection = collection.filter(
      item => (Object.prototype.hasOwnProperty.call(item, 'c'))
    );

    expect(filteredCollection).to.has.length(1);
    expect(filteredCollection[0]).to.have.includes.keys('c', 'd');
  });

  it('Check revertMap collection', () => {
    const collection = new Collection(getTwoSimpleObject());
    const arrayOfIndex = [];
    const collectionArray = collection.revertMap((element, index) => {
      arrayOfIndex.push(index);
      return element;
    });

    expect(arrayOfIndex).to.has.length(2);
    expect(arrayOfIndex).to.have.members([0, 1]);
    expect(collectionArray).to.be.a('array');
    expect(collectionArray[0]).to.have.includes.keys('e', 'f');
    expect(collectionArray[1]).to.have.includes.keys('c', 'd');
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

  context('pre sort', () => {
    it('pre sort option', () => {
      const orderFunction = (a, b) => (a.a - b.a);

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

  it('Call constructor with models', () => {
    const instance = new ModelWithPrimaryKeyMock({ a: 'a' });
    const collectionInstance = new CollectionWithModelMock([instance]);

    expect(collectionInstance.size()).to.be.equal(1);
  });

  it('Remove an element', () => {
    const instances = [
      new ModelWithPrimaryKeyMock({ a: '1' }), new ModelWithPrimaryKeyMock({ a: '2' }),
    ];

    const collectionInstance = new CollectionWithModelMock(instances);

    collectionInstance.remove('2');

    expect(collectionInstance.size()).to.be.equal(1);
    expect(collectionInstance.getFirst()).to.be.deep.equal({
      a: '1',
    });
  });
});

