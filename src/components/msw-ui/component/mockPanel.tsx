import clsx from 'clsx';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { useStores } from '../handles';
import { AddMockPanel } from './addMockPanel';
import { GroupMockPanel } from './groupMockPanel';

export const MockPanel = observer(() => {
	const [showDetail, setShowDetail] = useState(false);
	const [tabActiveIndex, setTabActiveIndex] = useState(0);
	const {store} = useStores();
	useEffect(() => {
		store.init();
	}, [])
	return <div className='container'>
	{
		!showDetail && <div className='container_circle' onClick={() => setShowDetail(true)}>MSW</div>
	}
	{
		showDetail && <div className='msw_detail_panel'>
			<div className='msw_header'>
				<div className='msw_close' onClick={() => setShowDetail(false)}>X</div>
			</div>
			<div className='msw_content'>
				<div className='msw_content_tab'>
					<div onClick={() => {
						store.setCurrentEditGroupRequest(undefined);
						setTabActiveIndex(0);
					}} className={clsx('msw_content_tab_item', {active: tabActiveIndex === 0})}>请求</div>
					<div onClick={() => {
						store.setCurrentEditGroupRequest(undefined);
						setTabActiveIndex(1);
					}} className={clsx('msw_content_tab_item', {active: tabActiveIndex === 1})}>请求组</div>
				</div>
				<div className='msw_content_tab_body'>
					{tabActiveIndex === 0 && <AddMockPanel />}
					{tabActiveIndex === 1 && <GroupMockPanel />}
				</div>
			</div>
		</div>
	}
</div>
})
