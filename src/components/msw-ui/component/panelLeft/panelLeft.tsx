import clsx from 'clsx';
import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useState } from 'react';
import './index.less';

import { useStores } from '../../handles';
import { checkEnableInCollection, checkEnableInGroup } from '../../handlesFnc';
import { groupsRequestTypeItem, IGroupDataItem } from '../../handlesType';
import { operationArr, operationRequestArr } from '../consts';
import { MswDot } from '../dot/dot';
import { Dropdown } from '../dropdown/dropdown';
import { Menu } from '../menu/menu';

import $ from 'jquery';

import { MswModal } from '../modal/modal';

import { CopyModal, NameEditModal } from './components/nameEdit/nameEdit';

const downIcon = require('../../images/down.png');
const moreIcon = require('../../images/more.png');

export const PanelLeft = observer(() => {
  const { store } = useStores();
  const { groupRequest } = store;
  useEffect(() => {
    $('.msw_content_left_item_wrap').on(
      'click',
      '.msw_moreIcon_wrap',
      function() {
        const $menuItem = $(this).closest('.msw_dropdown_children'),
          $submenuWrapper = $($menuItem)
            .closest('.msw_dropdown')
            .find('.msw_dropdown_panel');
        const menuItemPos = $menuItem.offset();
        $menuItem &&
          $submenuWrapper.css({
            position: 'fixed',
            top: menuItemPos?.top ? menuItemPos.top + 16 : 0,
            left: (menuItemPos?.left || 0) + 25
          });
      }
    );
    return () => {
      $('.msw_content_left_item_wrap').off('click');
    };
  }, []);
  return (
    <div className="msw_content_left_item_wrap">
      {groupRequest?.collection?.map(im => {
        return <MswContentLeftItem item={im} />;
      })}
    </div>
  );
});

const MswContentLeftItem = observer(
  (props: { item: groupsRequestTypeItem }) => {
    const { item } = props;
    const [expand, setExpand] = useState(false);
    const { store } = useStores();
    const [nameEditModal, setNameEditModal] = useState(false);
    const { deleteCollection, groupRequest, changeCollectionStatus } = store;
    const data = item?.data || {};
    const menuChange = useCallback(
      (value: string) => {
        if (value === 'delete') {
          MswModal.show({
            title: '确认要删除吗？',
            onOk: () => deleteCollection(item.name)
          });
        }
        if (value === 'enable' || value === 'disable') {
          changeCollectionStatus(item.name, value === 'enable');
        }
        if (value === 'editName') {
          setNameEditModal(true);
        }
      },
      [item]
    );
    return (
      <>
        <div className="msw_content_left_item" style={{ paddingLeft: 10 }}>
          <LisItem
            setExpand={setExpand}
            expand={expand}
            name={
              <span
                className={clsx('msw_content_left_item_name')}
                title={item.name}
                style={{ maxWidth: 160 }}
              >
                <MswDot
                  color={
                    checkEnableInCollection(item.name, groupRequest)
                      ? '#42AD00'
                      : '#F04042'
                  }
                  style={{ marginRight: 5 }}
                />
                {item.name}
              </span>
            }
            menuChange={menuChange}
            operationArr={operationArr}
          />
        </div>
        {expand && (
          <div>
            {Object.keys(data).map(im => {
              return (
                <MswContentLeftGroupItem
                  key={im}
                  groupName={im}
                  groupData={data[im]}
                  collectionName={item.name}
                />
              );
            })}
          </div>
        )}
        <NameEditModal
          level="collection"
          collectionName={item.name}
          visible={nameEditModal}
          setVisible={setNameEditModal}
        />
      </>
    );
  }
);

const MswContentLeftGroupItem = observer(
  (props: {
    groupName: string;
    collectionName: string;
    groupData: {
      data: IGroupDataItem[];
    };
  }) => {
    const { groupName, groupData, collectionName } = props;
    const [expand, setExpand] = useState(false);
    const { store } = useStores();
    const [nameEditModal, setNameEditModal] = useState(false);
    const [copyModal, setCopyModal] = useState(false);
    const { deleteGroup, groupRequest, activeGroup } = store;
    const menuChange = useCallback(
      (value: string) => {
        if (value === 'delete') {
          MswModal.show({
            title: '确认要删除吗？',
            onOk: () => deleteGroup(collectionName, groupName)
          });
        }
        if (value === 'enable' || value === 'disable') {
          activeGroup(collectionName, groupName, value === 'enable');
        }
        if (value === 'editName') {
          setNameEditModal(true);
        }
        if (value === 'copy') {
          setCopyModal(true);
        }
      },
      [collectionName, groupName]
    );
    return (
      <>
        <div
          className="msw_content_left_item"
          style={{
            paddingLeft: 20,
            borderBottom: 'none'
          }}
        >
          <LisItem
            setExpand={setExpand}
            expand={expand}
            name={
              <span
                className={clsx('msw_content_left_item_name')}
                title={groupName}
                style={{ maxWidth: 150 }}
              >
                <MswDot
                  color={
                    checkEnableInGroup(collectionName, groupName, groupRequest)
                      ? '#42AD00'
                      : '#F04042'
                  }
                  style={{ marginRight: 5 }}
                />
                {groupName}
              </span>
            }
            menuChange={menuChange}
            operationArr={[...operationArr, { label: '复制', value: 'copy' }]}
          />
        </div>
        {expand && (
          <div>
            {groupData.data?.map(im => {
              return (
                <MswContentLeftGroupRequestItem key={im.request.id} item={im} />
              );
            })}
          </div>
        )}
        <NameEditModal
          level="group"
          collectionName={collectionName}
          groupName={groupName}
          visible={nameEditModal}
          setVisible={setNameEditModal}
        />
        <CopyModal
          level="group"
          collectionName={collectionName}
          groupName={groupName}
          visible={copyModal}
          setVisible={setCopyModal}
        />
      </>
    );
  }
);

const MswContentLeftGroupRequestItem = observer(
  (props: { item: IGroupDataItem }) => {
    const { item } = props;
    const { store } = useStores();
    const {
      setCurrentEditGroupRequest,
      deleteGroupItem,
      changeGroupItemStatus
    } = store;
    const [nameEditModal, setNameEditModal] = useState(false);
    const menuChange = useCallback(
      (value: string) => {
        if (value === 'delete') {
          MswModal.show({
            title: '确认要删除吗？',
            onOk: () => deleteGroupItem(item)
          });
        }
        if (value === 'enable' || value === 'disable') {
          changeGroupItemStatus(item, value === 'enable');
        }
        if (value === 'editName') {
          setNameEditModal(true);
        }
      },
      [item]
    );
    return (
      <div
        className="msw_content_left_item"
        style={{ paddingLeft: 30, borderBottom: 'none' }}
      >
        <div className="msw_content_left_item_inner">
          <span
            onClick={() => setCurrentEditGroupRequest(item)}
            style={{ cursor: 'pointer', display: 'block', width: '100%' }}
          >
            <span style={{ fontSize: 12, color: 'rgb(255, 178, 0)' }}>
              {item.request.method?.toUpperCase()}
            </span>
            <span style={{ paddingLeft: 5 }}>
              <span
                className={clsx('msw_content_left_item_name')}
                title={item.name}
                style={{ maxWidth: 120 }}
              >
                <MswDot
                  color={!item.disabled ? '#42AD00' : '#F04042'}
                  style={{ marginRight: 5 }}
                />
                {item.name || '接口未命名'}
              </span>
            </span>
          </span>
          <Dropdown
            placement="right"
            content={
              <Menu options={operationRequestArr} onChange={menuChange} />
            }
          >
            <span className="msw_moreIcon_wrap">
              <img src={moreIcon} alt="" className="msw_moreIcon" />
            </span>
          </Dropdown>
        </div>
        <NameEditModal
          level="request"
          collectionName={item.collection}
          groupName={item.group}
          visible={nameEditModal}
          request={item}
          setVisible={setNameEditModal}
        />
      </div>
    );
  }
);

const LisItem = (props: {
  setExpand?: React.Dispatch<React.SetStateAction<boolean>>;
  expand?: boolean;
  name: string | React.ReactNode;
  menuChange: (value: string) => void;
  operationArr: { label: string; value: string }[];
}) => {
  const { setExpand, expand, name, menuChange, operationArr } = props;
  return (
    <div className="msw_content_left_item_inner">
      <span
        onClick={() => setExpand?.(!expand)}
        style={{ cursor: 'pointer', display: 'block', width: '100%' }}
      >
        <img
          src={downIcon}
          className={clsx('msw_downIcon', {
            msw_dowIcon_expand: expand
          })}
          alt=""
        />
        <span style={{ paddingLeft: 5 }}>{name}</span>
      </span>
      <Dropdown
        placement="right"
        content={<Menu options={operationArr} onChange={menuChange} />}
      >
        <span className="msw_moreIcon_wrap">
          <img src={moreIcon} alt="" className="msw_moreIcon" />
        </span>
      </Dropdown>
    </div>
  );
};