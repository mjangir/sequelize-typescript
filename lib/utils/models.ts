import 'reflect-metadata';
import {DataTypeAbstract, DefineOptions} from 'sequelize';
import {Model} from "../models/Model";
import {DataType} from "../enums/DataType";
import {ISequelizeForeignKeyConfig} from "../interfaces/ISequelizeForeignKeyConfig";
import {IPartialDefineAttributeColumnOptions} from "../interfaces/IPartialDefineAttributeColumnOptions";

const MODEL_NAME_KEY = 'sequelize:modelName';
const ATTRIBUTES_KEY = 'sequelize:attributes';
const OPTIONS_KEY = 'sequelize:options';
const FOREIGN_KEYS_KEY = 'sequelize:foreignKey';
const DEFAULT_OPTIONS: DefineOptions<any> = {
  timestamps: false
};

/**
 * Sets model name from class by storing this
 * information through reflect metadata
 */
export function setModelName(target: any, modelName: string): void {

  Reflect.defineMetadata(MODEL_NAME_KEY, modelName, target);
}

/**
 * Returns model name from class by restoring this
 * information from reflect metadata
 */
export function getModelName(target: any): string {

  return Reflect.getMetadata(MODEL_NAME_KEY, target);
}

/**
 * Returns model attributes from class by restoring this
 * information from reflect metadata
 */
export function getAttributes(target: any): any|undefined {

  return Reflect.getMetadata(ATTRIBUTES_KEY, target);
}

/**
 * Sets attributes
 */
export function setAttributes(target: any, attributes: any): void {

  Reflect.defineMetadata(ATTRIBUTES_KEY, attributes, target);
}

/**
 * Adds model attribute by specified property name and
 * sequelize attribute options and stores this information
 * through reflect metadata
 */
export function addAttribute(target: any,
                             name: string,
                             options: any): void {

  let attributes = getAttributes(target);

  if (!attributes) {
    attributes = {};
    setAttributes(target, attributes);
  }

  attributes[name] = Object.assign({}, options);
}

export function addAttributeOptions(target: any,
                                    propertyName: string,
                                    options: IPartialDefineAttributeColumnOptions): void {

  const attributes = getAttributes(target);

  if (!attributes || !attributes[propertyName]) {
    throw new Error(`@Column annotation is missing for "${propertyName}" of class "${target.constructor.name}"` +
    ` or annotation order is wrong.`);
  }

  attributes[propertyName] = Object.assign(attributes[propertyName], options);
}

/**
 * Returns sequelize define options from class prototype
 * by restoring this information from reflect metadata
 */
export function getOptions(target: any): DefineOptions<any>|undefined {

  return Reflect.getMetadata(OPTIONS_KEY, target);
}

export function setOptions(target: any, options: DefineOptions<any>): void {

  Reflect.defineMetadata(OPTIONS_KEY, Object.assign({}, DEFAULT_OPTIONS, options), target);
}

export function addOptions(target: any, options: DefineOptions<any>): void {

  let _options = getOptions(target);

  if (!_options) {
    _options = {};
  }

  setOptions(target, Object.assign(_options, options));
}

/**
 * Maps design types to sequelize data types;
 * @throws if design type cannot be automatically mapped to
 * a sequelize data type
 */
export function getSequelizeTypeByDesignType(target: any, propertyName: string): DataTypeAbstract {

  const type = Reflect.getMetadata('design:type', target, propertyName);

  switch (type) {
    case String:
      return DataType.STRING;
    case Number:
      return DataType.INTEGER;
    case Boolean:
      return DataType.BOOLEAN;
    case Date:
      return DataType.DATE;
    default:
      throw new Error(`Specified type of property '${propertyName}' 
            cannot be automatically resolved to a sequelize data type. Please
            define the data type manually`);
  }
}

/**
 * Adds foreign key meta data for specified class
 */
export function addForeignKey(target: any,
                              relatedClassGetter: () => typeof Model,
                              propertyName: string): void {

  let foreignKeys = getForeignKeys(target);

  if (!foreignKeys) {
    foreignKeys = [];
    setForeignKeys(target, foreignKeys);
  }

  foreignKeys.push({
    relatedClassGetter,
    foreignKey: propertyName
  });
}

/**
 * Returns foreign key meta data from specified class
 */
function getForeignKeys(target: any): ISequelizeForeignKeyConfig[]|undefined {

  return Reflect.getMetadata(FOREIGN_KEYS_KEY, target);
}

/**
 * Set foreign key meta data for specified prototype
 */
function setForeignKeys(target: any, foreignKeys: ISequelizeForeignKeyConfig[]): void {

  Reflect.defineMetadata(FOREIGN_KEYS_KEY, foreignKeys, target);
}