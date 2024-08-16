import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import ModuleGrain from './grain.js';

export default class ModulePassage extends Component {
  @service router;
  @service metrics;
  @service store;
  @service modulixAutoScroll;

  displayableGrains = this.args.module.grains.filter((grain) => ModuleGrain.getSupportedComponents(grain).length > 0);
  @tracked grainsToDisplay = this.displayableGrains.length > 0 ? [this.displayableGrains[0]] : [];

  @action
  hasGrainJustAppeared(index) {
    if (this.grainsToDisplay.length === 1) {
      return false;
    }

    return this.grainsToDisplay.length - 1 === index;
  }

  get hasNextGrain() {
    return this.grainsToDisplay.length < this.displayableGrains.length;
  }

  get currentGrainIndex() {
    return this.grainsToDisplay.length - 1;
  }

  @action
  onGrainSkip() {
    const currentGrain = this.displayableGrains[this.currentGrainIndex];

    this.addNextGrainToDisplay();

    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.id}`,
      'pix-event-name': `Click sur le bouton passer du grain : ${currentGrain.id}`,
    });
  }

  @action
  onGrainContinue() {
    const currentGrain = this.displayableGrains[this.currentGrainIndex];

    this.addNextGrainToDisplay();

    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.id}`,
      'pix-event-name': `Click sur le bouton continuer du grain : ${currentGrain.id}`,
    });
  }

  @action
  onStepperNextStep(currentStepPosition) {
    const currentGrain = this.displayableGrains[this.currentGrainIndex];

    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.id}`,
      'pix-event-name': `Click sur le bouton suivant de l'étape ${currentStepPosition} du stepper dans le grain : ${currentGrain.id}`,
    });
  }

  addNextGrainToDisplay() {
    if (!this.hasNextGrain) {
      return;
    }

    const nextGrain = this.displayableGrains[this.currentGrainIndex + 1];
    this.grainsToDisplay = [...this.grainsToDisplay, nextGrain];
  }

  @action
  grainCanMoveToNextGrain(index) {
    return this.currentGrainIndex === index && this.hasNextGrain;
  }

  @action
  grainShouldDisplayTerminateButton(index) {
    return this.currentGrainIndex === index && !this.hasNextGrain;
  }

  @action
  grainTransition(grainId) {
    return this.args.module.transitionTexts.find((transition) => transition.grainId === grainId);
  }

  @action
  onModuleTerminate({ grainId }) {
    this.args.passage.terminate();
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.id}`,
      'pix-event-name': `Click sur le bouton Terminer du grain : ${grainId}`,
    });
    return this.router.transitionTo('module.recap', this.args.module);
  }

  @action
  async onElementAnswer(answerData) {
    await this.store
      .createRecord('element-answer', {
        userResponse: answerData.userResponse,
        elementId: answerData.element.id,
        passage: this.args.passage,
      })
      .save({
        adapterOptions: { passageId: this.args.passage.id },
      });

    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.id}`,
      'pix-event-name': `Click sur le bouton vérifier de l'élément : ${answerData.element.id}`,
    });
  }

  @action
  async onElementRetry(answerData) {
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.id}`,
      'pix-event-name': `Click sur le bouton réessayer de l'élément : ${answerData.element.id}`,
    });
  }

  @action
  async onImageAlternativeTextOpen(imageElementId) {
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.id}`,
      'pix-event-name': `Click sur le bouton alternative textuelle : ${imageElementId}`,
    });
  }

  @action
  async onVideoTranscriptionOpen(videoElementId) {
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.id}`,
      'pix-event-name': `Click sur le bouton transcription : ${videoElementId}`,
    });
  }

  @action
  async onVideoPlay({ elementId }) {
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.id}`,
      'pix-event-name': `Click sur le bouton Play : ${elementId}`,
    });
  }

  @action
  async onFileDownload({ elementId, downloadedFormat }) {
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.id}`,
      'pix-event-name': `Click sur le bouton Télécharger au format ${downloadedFormat} de ${elementId}`,
    });
  }
}
