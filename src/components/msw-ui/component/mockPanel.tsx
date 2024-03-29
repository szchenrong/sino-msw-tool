import clsx from 'clsx';
import { observer } from 'mobx-react';
import React, { DetailedHTMLProps, useCallback, useState } from 'react';
import './index.less';

import { useStores } from '../handles';
import { mswPlacement } from '../MswUi';

import { Confirm } from './confirm/confirm';
import { Input } from './input/input';
import { PanelLeft } from './panelLeft/panelLeft';
import { PanelRight } from './panelRight/panelRight';
//@ts-ignore
import addBtn from '../images/add.png';
import { useDragPosition } from './hooks/drag';
import { useHotkeys } from 'react-hotkeys-hook';
import { HotKeys } from '../hotKeys';

export const MockPanel = observer((props: { placement?: mswPlacement }) => {
  const { placement } = props;
  const [showDetail, setShowDetail] = useState(false);
  useHotkeys(HotKeys.QUIT, () => {
    setShowDetail(false)
  });

  return (
    <>
      <MockLogo
        showDetail={showDetail}
        placement={placement}
        setShowDetail={setShowDetail}
      />
      <div
        className={clsx('msw_container', {
          'msw_container-left': placement === 'leftBottom',
          'msw_container-show': showDetail,
        })}
        style={{ display: showDetail ? 'block' : 'none' }}
      >
        <div style={{ display: showDetail ? 'block' : 'none', height: '100%' }}>
          <MockDetail setShowDetail={setShowDetail} />
        </div>
      </div>
    </>
  );
});

interface MockLogoProps extends DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  showDetail: boolean;
  placement: mswPlacement;
  setShowDetail: React.Dispatch<React.SetStateAction<boolean>>;
}
export function MockLogo({
  placement,
  setShowDetail,
  showDetail,
}: MockLogoProps) {
  const { store } = useStores();
  const { projectName } = store;
  const props = useDragPosition(projectName)
  return (
    <div
      className={clsx('msw_container_circle', {
        'msw_container_circle-leftBottom': placement === 'leftBottom',
        'msw_container_circle-hide': showDetail,
      })}
      data-testid="msw_circle"
      {...props}
      onClick={() => setShowDetail(true)}
    >
      M
    </div>
  );
}

export function MockDetail(props: {
  setShowDetail: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { setShowDetail } = props;
  const { store } = useStores();
  const [addCollectionError, setAddCollectionError] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const addCollection = useCallback(() => {
    return new Promise((resolve, reject) => {
      const result = store.addCollection(newCollectionName);
      if (result.status) {
        setNewCollectionName('');
        resolve('');
      } else {
        setAddCollectionError(result.msg);
        reject(result.msg);
      }
    });
  }, [newCollectionName]);
  return (
    <div className="msw_detail_panel" data-testid="msw_detail_container" id="msw_detail_panel">
      <div className="msw_content">
        <div className="msw_content_left">
          <div className="msw_content_left_item" style={{ zIndex: 5, padding: 10 }}>
            <span>模块</span>
            <Confirm
              onOk={addCollection}
              onCancel={() => {
                setNewCollectionName('');
                setAddCollectionError('');
              }}
              content={
                <div>
                  <Input
                    value={newCollectionName}
                    onChange={(e) => {
                      setNewCollectionName(e.target.value);
                      setAddCollectionError('');
                    }}
                    placeholder="请输入模块名称"
                  />
                  {addCollectionError && <div className="errorField">{addCollectionError}</div>}
                </div>
              }
            >
              <span>
                <img className="msw_add_btn" src={addBtn} alt="" />
              </span>
            </Confirm>
          </div>
          <PanelLeft />
        </div>
        <div className="msw_content_right">
          <PanelRight setShowDetail={setShowDetail} />
        </div>
      </div>
    </div>
  );
}
