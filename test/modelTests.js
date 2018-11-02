/* eslint-disable no-new, no-unused-expressions*/
import { expect } from 'chai';
import { Model } from '../src';
import {
  getOneSimpleObject, unserializerMock, unserializerMockSecond,
  ModelWithPrimaryKeyMock, getAnotherSimpleObject, ModelWithRequiredFields,
  ModelWithRequiredFieldsChangeRequiredMessage, getOneSimpleObjectWithBoolean,
  ModelWithRequiredFieldsWithPrefieldLabel,
} from './mocks';

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

  context('checkRequiredFields function, Validate required fields', () => {
    it('Should return true if all fields are present', () => {
      const simpleObject = getOneSimpleObject();
      const testModel = new ModelWithRequiredFields(simpleObject);

      expect(testModel.checkRequiredFields()).to.be.equal(true);
    });

    it('Should return false if one or more fields are not present', () => {
      const simpleObject = getAnotherSimpleObject();
      const testModel = new ModelWithRequiredFields(simpleObject);

      expect(testModel.checkRequiredFields()).to.be.equal(false);
    });

    it('Should return false if one of fields are not present', () => {
      const testModel = new ModelWithRequiredFields({ a: 'a', c: 'c' });

      expect(testModel.checkRequiredFields()).to.be.equal(false);
    });

    it('Should return true if one of fields the value is false', () => {
      const simpleObject = getOneSimpleObjectWithBoolean();
      const testModel = new ModelWithRequiredFields(simpleObject);

      expect(testModel.checkRequiredFields()).to.be.equal(true);
    });
  });

  context('validateRequiredFields function, Validate required fields and returns errors', () => {
    it('Should return an array with errors fields', () => {
      const simpleObject = getAnotherSimpleObject();
      const testModel = new ModelWithRequiredFields(simpleObject);

      expect(testModel.validateRequiredFields()).to.be.deep.equal([
        {
          field: 'a',
          message: ModelWithRequiredFields._messageRequiredField,
        },
        {
          field: 'b',
          message: ModelWithRequiredFields._messageRequiredField,
        },
      ]);
    });

    it('Should return empty array if all fields are present', () => {
      const simpleObject = getOneSimpleObject();
      const testModel = new ModelWithRequiredFields(simpleObject);

      expect(testModel.validateRequiredFields()).to.be.deep.equal([]);
    });

    it('Should return a custom message if change _messageRequiredField', () => {
      const simpleObject = getAnotherSimpleObject();
      const testModel = new ModelWithRequiredFieldsChangeRequiredMessage(simpleObject);

      expect(testModel.validateRequiredFields()).to.be.deep.equal([
        {
          field: 'a',
          message: 'Test message',
        },
        {
          field: 'b',
          message: 'Test message',
        },
      ]);
    });

    it('Should concatenate a label to a field name if configure _preFieldLabel', () => {
      const simpleObject = getAnotherSimpleObject();
      const testModel = new ModelWithRequiredFieldsWithPrefieldLabel(simpleObject);

      expect(testModel.validateRequiredFields()).to.be.deep.equal([
        {
          field: 'test.label.a',
          message: ModelWithRequiredFieldsWithPrefieldLabel._messageRequiredField,
        },
        {
          field: 'test.label.b',
          message: ModelWithRequiredFieldsWithPrefieldLabel._messageRequiredField,
        },
      ]);
    });
  });

  context('isValidRequiredField, check a field required', () => {
    it('Should return true if the field is not required', () => {
      const simpleObject = getOneSimpleObject();
      const testModel = new ModelWithRequiredFields(simpleObject);

      expect(testModel.isValidRequiredField('c')).to.be.equal(true);
    });
    it('Should return true if the field is required and exists', () => {
      const simpleObject = getOneSimpleObject();
      const testModel = new ModelWithRequiredFields(simpleObject);

      expect(testModel.isValidRequiredField('a')).to.be.equal(true);
    });
    it('Should return false if the field is required and not exists', () => {
      const simpleObject = getAnotherSimpleObject();
      const testModel = new ModelWithRequiredFields(simpleObject);

      expect(testModel.isValidRequiredField('a')).to.be.equal(false);
    });
    it('Should return false if the field value is string and is empty', () => {
      const simpleObject = getOneSimpleObject();
      const testModel = new ModelWithRequiredFields(simpleObject);

      testModel.a = '';

      expect(testModel.isValidRequiredField('a')).to.be.equal(false);
    });
  });

  context('Especify the type of fields', () => {
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

    it('Specify type with a function', () => {
      class WithTypeFunctionPropertyModel extends Model {
        static _types = {
          typeModel: () => ModelWithPrimaryKeyMock,
        };
      }

      const propertyTypeModel = new WithTypeFunctionPropertyModel({
        a: 'a',
        typeModel: getOneSimpleObject(),
      });

      expect(propertyTypeModel.typeModel.constructor).to.be.equal(ModelWithPrimaryKeyMock);
    });
  });
});
