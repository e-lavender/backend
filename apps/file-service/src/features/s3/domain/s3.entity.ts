import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, ObjectId } from 'mongoose';
import { FileTypeEnum } from '../../../../enums';

export type FileDocument = HydratedDocument<File>;

export type FileModelType = Model<FileDocument> & FileStaticMethodType;

type FileStaticMethodType = {
  makeInstance: (
    eTag: string,
    userId: number,
    fileType: FileTypeEnum,
    key: string,
    metaData: MetadataType,
    FileModel: FileModelType,
  ) => FileDocument;
};

@Schema({ _id: false, versionKey: false })
export class MetadataType {
  @Prop({ default: false })
  fieldname: string;
  @Prop({ default: false })
  originalname: string;
  @Prop({ default: false })
  encoding: string;
  @Prop({ default: false })
  mimetype: string;
  @Prop({ default: false })
  size: number;
}

@Schema()
export class File {
  _id: ObjectId;
  @Prop({ required: true })
  eTag: string;
  @Prop({ required: false })
  userId: number;
  @Prop({ required: true })
  key: string;
  @Prop({ required: true, enum: FileTypeEnum, type: String })
  fileType: FileTypeEnum;
  @Prop({ type: MetadataType })
  metadata: MetadataType;

  static makeInstance(
    eTag: string,
    userId: number,
    fileType: FileTypeEnum,
    key: string,
    metadata: MetadataType,
    FileModel: FileModelType,
  ): FileDocument {
    return new FileModel({ eTag, userId, key, fileType, metadata });
  }
}

export const FileSchema = SchemaFactory.createForClass(File);

const fileStaticMethods: FileStaticMethodType = {
  makeInstance: File.makeInstance,
};

FileSchema.statics = fileStaticMethods;
