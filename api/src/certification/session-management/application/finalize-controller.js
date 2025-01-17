import * as events from '../../../../lib/domain/events/index.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import * as certificationReportSerializer from '../../shared/infrastructure/serializers/jsonapi/certification-report-serializer.js';
import { usecases } from '../domain/usecases/index.js';

const finalize = async function (request, h, dependencies = { certificationReportSerializer, events }) {
  const sessionId = request.params.sessionId;
  const examinerGlobalComment = request.payload.data.attributes['examiner-global-comment'];
  const hasIncident = request.payload.data.attributes['has-incident'];
  const hasJoiningIssue = request.payload.data.attributes['has-joining-issue'];
  const certificationReports = await Promise.all(
    (request.payload.data.included || [])
      .filter((data) => data.type === 'certification-reports')
      .map((data) => dependencies.certificationReportSerializer.deserialize({ data })),
  );

  let certificationJuryDoneEvents, autoJuryDone;
  await DomainTransaction.execute(async () => {
    const sessionFinalized = await usecases.finalizeSession({
      sessionId,
      examinerGlobalComment,
      hasIncident,
      hasJoiningIssue,
      certificationReports,
    });

    const events = await usecases.processAutoJury({ sessionFinalized });
    certificationJuryDoneEvents = events.certificationJuryDoneEvents;
    autoJuryDone = events.autoJuryDone;
  });
  await dependencies.events.eventDispatcher.dispatch(certificationJuryDoneEvents);
  await usecases.registerPublishableSession({ autoJuryDone });

  return h.response().code(200);
};

const finalizeController = {
  finalize,
};
export { finalizeController };
