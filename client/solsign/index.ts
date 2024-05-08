// profile
import createProfile from './instructions/create_profile';
import changeProfileUri from './instructions/change_profile_uri';
import getProfile from './state/get_profile';
// document
import createDocument from './instructions/create_document';
import getDocumentByCreatorIndex from './state/get_document_by_creator_index';
import listDocumentByCreator from './state/list_document_by_creator';
import listDocumentBySigner from './state/list_document_by_signer';
import getDocument from './state/get_document';
import changeDocumentURI from './instructions/change_document_uri';
import { activate, annul } from './instructions/change_document_status';
// sign
import { approve, reject } from './instructions/sign';
// config
import config from './config';
// constant
import STATUS from './state/document_status';
import SIGSTAT from './state/signature_status';

export default {
  setConfig: config.setConfig,
  createProfile,
  changeProfileUri,
  getProfile,
  createDocument,
  getDocumentByCreatorIndex,
  listDocumentByCreator,
  listDocumentBySigner,
  getDocument,
  changeDocumentURI,
  approve,
  reject,
  activate,
  annul,
  STATUS,
  SIGSTAT,
};
