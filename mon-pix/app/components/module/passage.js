import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import ModuleGrain from './grain.js';

export default class ModulePassage extends Component {
  @service router;
  @service metrics;
  @service store;

  displayableGrains = this.args.module.grains.filter((grain) => ModuleGrain.getSupportedComponents(grain).length > 0);
  @tracked grainsToDisplay = this.displayableGrains.length > 0 ? [this.displayableGrains[0]] : [];

  static SCROLL_OFFSET_PX = 70;

  @action
  setGrainScrollOffsetCssProperty(element) {
    element.style.setProperty('--grain-scroll-offset', `${ModulePassage.SCROLL_OFFSET_PX}px`);
  }

  get hasNextGrain() {
    return this.grainsToDisplay.length < this.displayableGrains.length;
  }

  get currentGrainIndex() {
    return this.grainsToDisplay.length - 1;
  }

  @action
  skipToNextGrain() {
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
  continueToNextGrain() {
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
  continueToNextStep(currentStepPosition) {
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
  hasGrainJustAppeared(index) {
    if (this.grainsToDisplay.length === 1) {
      return false;
    }

    return this.grainsToDisplay.length - 1 === index;
  }

  @action
  terminateModule() {
    this.args.passage.terminate();
    return this.router.transitionTo('module.recap', this.args.module);
  }

  @action
  async submitAnswer(answerData) {
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
  async trackRetry(answerData) {
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.id}`,
      'pix-event-name': `Click sur le bouton réessayer de l'élément : ${answerData.element.id}`,
    });
  }
}
