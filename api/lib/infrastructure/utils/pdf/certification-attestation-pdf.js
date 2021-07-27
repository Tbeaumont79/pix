const { PDFPage, PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const pdfLibFontkit = require('@pdf-lib/fontkit');
const sharp = require('sharp');
const AttestationViewModel = require('./AttestationViewModel');
const _ = require('lodash');

const fonts = {
  openSansBold: 'OpenSans-Bold.ttf',
  openSansSemiBold: 'OpenSans-SemiBold.ttf',
  robotoMedium: 'Roboto-Medium.ttf',
  robotoMonoRegular: 'RobotoMono-Regular.ttf',
};

const images = {
  clea: 'clea',
  pixPlusDroit: 'pixPlusDroit',
};

const templates = {
  withoutComplementaryCertifications: 'withoutComplementaryCertifications',
  withComplementaryCertifications: 'withComplementaryCertifications',
};

async function getCertificationAttestationsPdfBuffer({
  certificates,
  fileSystem = fs.promises,
  pdfWriter = PDFDocument,
  bufferFromBytes = Buffer.from,
  imageUtils = sharp,
  dirname = __dirname,
  fontkit = pdfLibFontkit,
} = {}) {

  const viewModels = certificates.map(AttestationViewModel.from);
  const generatedPdfDoc = await _initializeNewPDFDocument(pdfWriter, fontkit);
  const embeddedFonts = await _embedFonts(generatedPdfDoc, fileSystem, dirname);
  const embeddedImages = await _embedImages(generatedPdfDoc, viewModels, imageUtils);

  const templateDocuments = await _getTemplatePDFDocuments(viewModels, dirname, fileSystem, pdfWriter);

  await _render({ templateDocuments, pdfDocument: generatedPdfDoc, viewModels, rgb, embeddedFonts, embeddedImages });

  const buffer = await _finalizeDocument(generatedPdfDoc, bufferFromBytes);

  return {
    buffer: buffer,
    fileName: viewModels[0].filename, // FIXME : resortir le file name du view model
  };
}

async function _initializeNewPDFDocument(pdfWriter, fontkit) {
  const pdfDocument = await pdfWriter.create();
  pdfDocument.registerFontkit(fontkit);
  return pdfDocument;
}

async function _embedFonts(pdfDocument, fileSystem, dirname) {
  const embeddedFonts = {};
  for (const fontKey in fonts) {
    const embeddedFont = await _embedFontInPDFDocument(pdfDocument, fonts[fontKey], fileSystem, dirname);
    embeddedFonts[fontKey] = embeddedFont;
  }
  return embeddedFonts;
}

async function _embedFontInPDFDocument(pdfDoc, fontFileName, fileSystem, dirname) {
  const fontFile = await fileSystem.readFile(`${dirname}/files/${fontFileName}`);
  return pdfDoc.embedFont(fontFile);
}

async function _embedImages(pdfDocument, viewModels, imageUtils) {
  const embeddedImages = {};
  const viewModelsWithCleaCertification =
    _.filter(viewModels, (viewModel) => viewModel.shouldDisplayCleaCertification());

  if (viewModelsWithCleaCertification.length > 0) {
    // FIXME ? Ici on présuppose que tous les macarons Cléa sont identiques
    const cleaCertificationImagePath = viewModelsWithCleaCertification[0].cleaCertificationImagePath;
    const image = await _embedCleaCertificationImage(pdfDocument, cleaCertificationImagePath, imageUtils);
    embeddedImages[images.clea] = image;
  }

  const viewModelsWithPixPlusDroitCertification =
    _.filter(viewModels, (viewModel) => viewModel.shouldDisplayPixPlusDroitCertification());

  if (viewModelsWithPixPlusDroitCertification.length > 0) {
    // FIXME ? Ici on présuppose que tous les macarons Pix+ droit sont identiques
    const pixPlusDroitCertificationImagePath = viewModelsWithPixPlusDroitCertification[0].pixPlusDroitCertificationImagePath;
    const image = await _embedPixPlusDroitCertificationImage(pdfDocument, pixPlusDroitCertificationImagePath, imageUtils);
    embeddedImages[images.pixPlusDroit] = image;
  }
  return embeddedImages;
}

async function _embedCleaCertificationImage(pdfDocument, cleaCertificationImagePath, imageUtils) {
  const pngBuffer = await imageUtils(cleaCertificationImagePath)
    .resize(80, 100, {
      fit: 'inside',
    })
    .sharpen()
    .toBuffer();
  const pngImage = await pdfDocument.embedPng(pngBuffer);
  return pngImage;
}

async function _embedPixPlusDroitCertificationImage(pdfDocument, pixPlusDroitCertificationImagePath, imageUtils) {
  const pngBuffer = await imageUtils(pixPlusDroitCertificationImagePath)
    .resize(100, 120, {
      fit: 'inside',
    })
    .sharpen()
    .toBuffer();
  const pngImage = await pdfDocument.embedPng(pngBuffer);
  return pngImage;
}

async function _getTemplatePDFDocuments(viewModels, dirname, fileSystem, pdfWriter) {
  const certificatesWithComplementaryCertifications =
    _.filter(viewModels, (viewModel) => viewModel.shouldDisplayComplementaryCertifications());

  const loadedTemplates = {};
  if (viewModels.length !== certificatesWithComplementaryCertifications.length) {
    const template = await _loadTemplate('attestation-template.pdf', dirname, fileSystem, pdfWriter);
    loadedTemplates[templates.withoutComplementaryCertifications] = template;
  }
  if (certificatesWithComplementaryCertifications.length > 0) {
    const template = await _loadTemplate('attestation-template-with-complementary-certifications.pdf', dirname, fileSystem, pdfWriter);
    loadedTemplates[templates.withComplementaryCertifications] = template;
  }
  return loadedTemplates;
}

async function _loadTemplate(templateFileName, dirname, fileSystem, pdfWriter) {
  const path = `${dirname}/files/${templateFileName}`;
  const basePdfBytes = await fileSystem.readFile(path);
  return await pdfWriter.load(basePdfBytes);
}

async function _render({ templateDocuments, pdfDocument, viewModels, rgb, embeddedFonts, embeddedImages }) {

  const page = await _copyPageFromTemplateIntoDocument(viewModels[0], pdfDocument, templateDocuments);

  for (const viewModel of viewModels) {
    const newPageLeaf = page.node.clone();
    const ref = pdfDocument.context.register(newPageLeaf);
    const newPage = PDFPage.of(newPageLeaf, ref, pdfDocument);

    _renderScore(viewModel, newPage, embeddedFonts);
    _renderHeaderCandidateInformations(viewModel, newPage, rgb, embeddedFonts);
    _renderCompetencesDetails(viewModel, newPage, rgb, embeddedFonts);
    _renderFooter(viewModel, newPage, rgb, embeddedFonts);
    _renderMaxScore(viewModel, newPage, rgb, embeddedFonts);
    _renderMaxLevel(viewModel, newPage, rgb, embeddedFonts);
    _renderVerificationCode(viewModel, newPage, rgb, embeddedFonts);
    _renderCleaCertification(viewModel, newPage, embeddedImages);
    _renderPixPlusCertificationCertification(viewModel, newPage, embeddedImages);

    pdfDocument.addPage(newPage);
  }
}

async function _copyPageFromTemplateIntoDocument(viewModel, pdfDocument, templatePdfDocuments) {
  if (viewModel.shouldDisplayComplementaryCertifications()) {
    const pages = await pdfDocument.copyPages(
      templatePdfDocuments.withComplementaryCertifications,
      [0],
    );
    return pages[0];
  } else {
    const pages = await pdfDocument.copyPages(
      templatePdfDocuments.withoutComplementaryCertifications,
      [0],
    );
    return pages[0];
  }
}

function _renderScore(viewModel, page, embeddedFonts) {
  const pixScore = viewModel.pixScore;
  const scoreFontSize = 24;
  const scoreFont = embeddedFonts.openSansBold;
  const scoreWidth = scoreFont.widthOfTextAtSize(pixScore, scoreFontSize);

  page.setFont(scoreFont);
  page.drawText(
    pixScore,
    {
      x: 105 - scoreWidth / 2,
      y: 675,
      size: scoreFontSize,
    },
  );
}

function _renderMaxScore(viewModel, page, rgb, embeddedFonts) {
  const font = embeddedFonts.openSansSemiBold;
  const maxScoreFontSize = 9;

  const maxReachableScore = viewModel.maxReachableScore;
  const maxScoreWidth = font.widthOfTextAtSize(maxReachableScore, maxScoreFontSize);

  page.setFont(font);
  page.drawText(
    maxReachableScore,
    {
      x: 105 - maxScoreWidth / 2, y: 659,
      size: maxScoreFontSize,
      color: rgb(0 / 255, 45 / 255, 80 / 255),
    },
  );
}

function _renderMaxLevel(viewModel, page, rgb, embeddedFonts) {
  page.setFont(embeddedFonts.openSansSemiBold);
  page.drawText(
    viewModel.maxLevel,
    {
      x: 159, y: 608,
      size: 7,
      color: rgb(80 / 255, 95 / 255, 121 / 255),
    },
  );
}

function _renderFooter(viewModel, page, rgb, embeddedFonts) {
  page.setFont(embeddedFonts.openSansBold);
  page.drawText(
    viewModel.maxReachableLevelIndication,
    {
      x: 55, y: 46,
      size: 7,
      color: rgb(42 / 255, 64 / 255, 99 / 255),
    },
  );

  if (viewModel.shouldDisplayAbsoluteMaxLevelIndication()) {
    page.drawText(
      viewModel.absoluteMaxLevelIndication,
      {
        x: 55, y: 35,
        size: 7,
        color: rgb(42 / 255, 64 / 255, 99 / 255),
      },
    );
  }
}

function _renderHeaderCandidateInformations(viewModel, page, rgb, embeddedFonts) {
  page.setFont(embeddedFonts.openSansBold);
  [
    [230, 712, viewModel.fullName],
    [269, 695.5, viewModel.birth],
    [257, 680, viewModel.certificationCenter],
    [208, 663.5, viewModel.certificationDate],
  ].forEach(([x, y, text]) => {
    page.drawText(
      text,
      {
        x,
        y,
        size: 9,
        color: rgb(26 / 255, 64 / 255, 109 / 255),
      },
    );
  });
}

function _renderVerificationCode(viewModel, page, rgb, embeddedFonts) {
  page.setFont(embeddedFonts.robotoMonoRegular);
  page.drawText(
    viewModel.verificationCode,
    {
      x: 410,
      y: 560,
      size: 11,
      color: rgb(1, 1, 1),
    },
  );
}

function _renderPixPlusCertificationCertification(viewModel, page, embeddedImages) {
  let yCoordinate = 385;

  if (viewModel.shouldDisplayCleaCertification()) {
    yCoordinate = 290;
  }

  if (viewModel.shouldDisplayPixPlusDroitCertification()) {
    const pngImage = embeddedImages[images.pixPlusDroit];
    page.drawImage(
      pngImage,
      {
        x: 390,
        y: yCoordinate,
      },
    );
  }
}

function _renderCleaCertification(viewModel, page, embeddedImages) {
  if (viewModel.shouldDisplayCleaCertification()) {
    const pngImage = embeddedImages[images.clea];
    page.drawImage(
      pngImage,
      {
        x: 400,
        y: 400,
      },
    );
  }
}

function _renderCompetencesDetails(viewModel, page, rgb, embeddedFonts) {
  const competencesLevelCoordinates = [
    556, 532, 508,
    452, 428, 404, 380,
    324, 300, 276, 252,
    196, 172, 148,
    92, 68,
  ];

  viewModel.competenceDetailViewModels.forEach((competenceDetailViewModel) => {
    const y = competencesLevelCoordinates.shift();
    if (competenceDetailViewModel.shouldBeDisplayed()) {
      page.setFont(embeddedFonts.robotoMedium);
      page.drawText(
        competenceDetailViewModel.level,
        {
          x: 291, y: y + 5,
          size: 9,
          color: rgb(37 / 255, 56 / 255, 88 / 255),
        },
      );
    } else {
      page.drawRectangle({
        x: 65,
        y,
        width: 210,
        height: 18,
        color: rgb(1, 1, 1),
        opacity: 0.5,
      });
    }
  });
}

async function _finalizeDocument(pdfDocument, bufferFromBytes) {
  const pdfBytes = await pdfDocument.save();
  const buffer = bufferFromBytes(pdfBytes);
  return buffer;
}

module.exports = {
  getCertificationAttestationsPdfBuffer,
};
