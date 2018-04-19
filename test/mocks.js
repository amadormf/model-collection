import { Model, Collection } from '../src';

export function getOneSimpleObject() {
  return {
    a: 'a',
    b: 'b',
  };
}

export function getAnotherSimpleObject() {
  return {
    g: 'g',
    h: 'h',
  };
}

export function getTwoSimpleObject() {
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

export function unserializerMock(obj) {
  return {
    c: obj.a,
    d: obj.b,
  };
}

export function unserializerMockSecond(obj) {
  return {
    e: obj.c,
    f: obj.d,
  };
}

export class ModelWithPrimaryKeyMock extends Model {
  static _primaryKey = 'a';
}

export class CollectionWithModelMock extends Collection {
  static _ModelClass = ModelWithPrimaryKeyMock;
}

export class CollectionWithSortMock extends Collection {
  static _sortFunction = (a, b) => a.a > b.a;
}

export class ModelWithRequiredFields extends Model {
  static _requiredFields = ['a', 'b'];
}
