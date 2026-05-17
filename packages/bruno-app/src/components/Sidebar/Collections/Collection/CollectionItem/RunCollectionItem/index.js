import React, { useRef, useState } from 'react';
import get from 'lodash/get';
import { uuid } from 'utils/common';
import Modal from 'components/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { addTab } from 'providers/ReduxStore/slices/tabs';
import { runCollectionFolder } from 'providers/ReduxStore/slices/collections/actions';
import StyledWrapper from './StyledWrapper';
import { areItemsLoading } from 'utils/collections';
import RunnerTags from 'components/RunnerResults/RunnerTags/index';
import { getRequestItemsForCollectionRun } from 'utils/collections/index';
import Button from 'ui/Button';
import toast from 'react-hot-toast';
import { parseDataFileContent } from '@usebruno/common/runner';

const RunCollectionItem = ({ collectionUid, item, onClose }) => {
  const dispatch = useDispatch();
  const [delay, setDelay] = useState('');
  const dataFileInputRef = useRef(null);

  const collection = useSelector((state) => state.collections.collections?.find((c) => c.uid === collectionUid));
  const isCollectionRunInProgress = collection?.runnerResult?.info?.status && (collection?.runnerResult?.info?.status !== 'ended');

  // tags for the collection run
  const tags = get(collection, 'runnerTags', { include: [], exclude: [] });

  const openRunnerTab = () => {
    dispatch(
      addTab({
        uid: uuid(),
        collectionUid: collection.uid,
        type: 'collection-runner'
      })
    );
  };

  const onSubmit = (recursive, iterationRows = null) => {
    openRunnerTab();
    if (!isCollectionRunInProgress) {
      dispatch(
        runCollectionFolder(
          collection.uid,
          item ? item.uid : null,
          recursive,
          delay ? Number(delay) : null,
          tags,
          null,
          iterationRows
        )
      );
    }
    onClose();
  };

  const handleRunWithParametersClick = (recursive) => {
    if (dataFileInputRef.current) {
      dataFileInputRef.current.dataset.recursive = recursive ? 'true' : 'false';
      dataFileInputRef.current.click();
    }
  };

  const handleDataFileSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    const lowerName = file.name.toLowerCase();
    let type = null;
    if (lowerName.endsWith('.csv')) {
      type = 'csv';
    } else if (lowerName.endsWith('.json')) {
      type = 'json';
    } else {
      toast.error('Select a .csv or .json data file');
      return;
    }

    const recursive = event.target.dataset.recursive === 'true';

    try {
      const content = await file.text();
      const { rows } = parseDataFileContent(content, type);
      onSubmit(recursive, rows);
    } catch (err) {
      toast.error(err?.message || 'Failed to parse data file');
    }
  };

  const handleViewRunner = (e) => {
    e.preventDefault();
    dispatch(
      addTab({
        uid: uuid(),
        collectionUid: collection.uid,
        type: 'collection-runner'
      })
    );
    onClose();
  };

  const isFolderLoading = areItemsLoading(item);

  const requestItemsForRecursiveFolderRun = getRequestItemsForCollectionRun({ recursive: true, tags, items: item ? item.items : collection.items });
  const totalRequestItemsCountForRecursiveFolderRun = requestItemsForRecursiveFolderRun.length;
  const shouldDisableRecursiveFolderRun = totalRequestItemsCountForRecursiveFolderRun <= 0;

  const requestItemsForFolderRun = getRequestItemsForCollectionRun({ recursive: false, tags, items: item ? item.items : collection.items });
  const totalRequestItemsCountForFolderRun = requestItemsForFolderRun.length;
  const shouldDisableFolderRun = totalRequestItemsCountForFolderRun <= 0;

  return (
    <StyledWrapper>
      <Modal size="md" title="Collection Runner" hideFooter={true} handleCancel={onClose}>
        <div>
          <div className="mb-1">
            <span className="font-medium">Run</span>
            <span className="ml-1 text-xs">({totalRequestItemsCountForFolderRun} requests)</span>
          </div>
          <div className="mb-3 description">This will only run the requests in this folder.</div>
          <div className="mb-1">
            <span className="font-medium">Recursive Run</span>
            <span className="ml-1 text-xs">({totalRequestItemsCountForRecursiveFolderRun} requests)</span>
          </div>
          <div className={`description ${isFolderLoading ? 'mb-2' : 'mb-6'}`}>This will run all the requests in this folder and all its subfolders.</div>
          {isFolderLoading ? <div className="mb-8 warning">Requests in this folder are still loading.</div> : null}
          {isCollectionRunInProgress ? <div className="mb-6 warning">A Collection Run is already in progress.</div> : null}

          <hr className="divider" />

          {/* Timings */}
          <div className="flex flex-col items-start gap-2 mb-8">
            <label htmlFor="runner-delay" className="block text-sm">Delay between requests (ms)</label>
            <input
              id="runner-delay"
              type="number"
              className="textbox w-1/2"
              placeholder="e.g. 5"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              value={delay}
              onChange={(e) => setDelay(e.target.value)}
            />
          </div>

          {/* Tags for the collection run */}
          <RunnerTags collectionUid={collection.uid} className="mb-6" />

          <input
            ref={dataFileInputRef}
            type="file"
            accept=".csv,.json"
            className="hidden"
            onChange={handleDataFileSelected}
          />

          <div className="flex flex-wrap justify-end gap-2 bruno-modal-footer">
            <Button type="button" color="secondary" variant="ghost" onClick={onClose} className="mr-3">
              Cancel
            </Button>
            {
              isCollectionRunInProgress
                ? (
                    <Button type="submit" onClick={handleViewRunner}>
                      View Run
                    </Button>
                  )
                : (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={shouldDisableRecursiveFolderRun}
                        onClick={() => handleRunWithParametersClick(true)}
                        className="mr-3"
                      >
                        Run with Parameters
                      </Button>
                      <Button type="submit" disabled={shouldDisableRecursiveFolderRun} onClick={() => onSubmit(true)} className="mr-3">
                        Recursive Run
                      </Button>
                      <Button type="submit" disabled={shouldDisableFolderRun} onClick={() => onSubmit(false)}>
                        Run
                      </Button>
                    </>
                  )
            }
          </div>
        </div>
      </Modal>
    </StyledWrapper>
  );
};

export default RunCollectionItem;
