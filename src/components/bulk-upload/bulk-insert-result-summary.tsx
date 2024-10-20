import { Alert, Button, Typography } from 'antd';
import FileSaver from 'file-saver';
import React, { FC } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { IdentityProps, withIdentity } from 'src/core/services/authentication';
import { ImportError } from 'src/core/ui/collections/table';
import { ImportResult } from './types';

interface BulkInsertResultsSummaryProps extends WithTranslation, IdentityProps {
  importResult: ImportResult;
}

const BulkInsertResultsSummary: FC<BulkInsertResultsSummaryProps> = (props) => {
  const { importResult, t } = props;

  const downloadLogsAsTxt = (onlyErrors: boolean, onlyWarnings: boolean) => {
    // preparing log file messages and name
    if (
      (onlyErrors && importResult?.errors && importResult?.errors.length > 0) ||
      (onlyWarnings && importResult?.warnings && importResult?.warnings.length > 0)
    ) {
      const fileName = onlyErrors ? 'errors.txt' : onlyWarnings ? 'warnings.txt' : 'logs.txt';
      const targetCollection = onlyErrors
        ? importResult.errors
        : onlyWarnings
        ? importResult.warnings
        : importResult.errors.concat(importResult.warnings);

      const blob = new Blob(targetCollection.map((o) => o.reason + '\n') as any, { type: 'text/plain' });
      FileSaver.saveAs(blob, fileName);
    }
  };

  const hasErrors = () => {
    return importResult?.errors && importResult.errors.length > 0;
  };

  const hasWarnings = () => {
    return importResult?.warnings && importResult.warnings.length > 0;
  };

  const renderErrors = (errors: ImportError[]) => {
    const errorList = errors.map((o) => `${t('Row')} ${o.row ?? '-'}: ${o.reason}`);
    return (
      <ul style={{ listStyle: 'none', paddingLeft: '0px' }}>
        {errorList.map((o) => (
          <li>
            <Typography.Text>{o}</Typography.Text>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      {importResult?.success && importResult?.totalElements > 0 && (
        <>
          <Alert message={`${t('Total elements')} : ${importResult.totalElements}`} banner type="info" showIcon />
          <Alert message={`${t('Total imported')} : ${importResult.importedElements}`} banner type="info" showIcon />
        </>
      )}
      {hasErrors() && (
        <>
          <Alert message={t('Errors')} description={renderErrors(importResult.errors)} banner type="error" showIcon={false} />
          <br></br>
          <Button size="small" onClick={() => downloadLogsAsTxt(true, false)}>
            {t('Download errors file')}
          </Button>
        </>
      )}
      {hasWarnings() && (
        <>
          <Button size="small" onClick={() => downloadLogsAsTxt(false, true)}>
            {t('Download warnings file')}
          </Button>
          <br></br>
          <Alert message={t('Warnings')} description={renderErrors(importResult.warnings)} banner type="warning" showIcon={false} />
        </>
      )}
    </div>
  );
};

export default withIdentity(withTranslation()(BulkInsertResultsSummary));
