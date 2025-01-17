/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

import React from 'react';
import { is as ImmutableIs, Map } from 'immutable';

import { getInstanceIds } from '../utils/api';
import { getUuidFormat, TEXT } from '../utils/uuid_definitions';
import AttributeItem, { CCCD_UUID } from './AttributeItem';
import HexOnlyEditableField from './HexOnlyEditableField';

function isCCCDAttribute(uuid) {
    return uuid === CCCD_UUID;
}

class DescriptorItem extends AttributeItem {
    constructor(props) {
        super(props);
        this.bars = 3;
        this.expandable = false;
        this.attributeType = 'descriptor';
        this.childAttributeType = '';
    }

    shouldComponentUpdate(nextProps) {
        const update =
            !ImmutableIs(this.props.item.value, nextProps.item.value) ||
            !ImmutableIs(
                this.props.item.errorMessage,
                nextProps.item.errorMessage
            ) ||
            !ImmutableIs(this.props.selected, nextProps.selected) ||
            !ImmutableIs(this.props.item.name, nextProps.item.name);
        return update;
    }

    renderContent() {
        const { item, selected } = this.props;

        const { uuid, instanceId, value } = item;

        const isLocal = this.isLocalAttribute();
        const isCCCD = isCCCDAttribute(uuid);
        const isLocalCCCD = isLocal && isCCCD;

        const onRead = !isLocal ? () => this.onRead() : undefined;

        const onWrite = !isLocalCCCD ? val => this.onWrite(val) : null;

        const itemIsSelected = instanceId === selected;

        const valueList = [];

        const showText = getUuidFormat(uuid) === TEXT;

        if (isLocalCCCD && Map.isMap(value)) {
            value.forEach((cccdValue, deviceInstanceId) => {
                const { address } = getInstanceIds(deviceInstanceId);
                const key = `${instanceId}-${deviceInstanceId}`;
                valueList.push(
                    <HexOnlyEditableField
                        key={key}
                        title={`CCCD value for device: ${address}`}
                        value={cccdValue.toArray()}
                        onWrite={onWrite}
                        onRead={onRead}
                        showReadButton={itemIsSelected}
                        selectParent={this.selectComponent}
                    />
                );
            });
        } else {
            valueList.push(
                <HexOnlyEditableField
                    key={instanceId}
                    value={value.toArray()}
                    onWrite={onWrite}
                    onRead={onRead}
                    showReadButton={itemIsSelected}
                    selectParent={this.selectComponent}
                    showText={showText}
                />
            );
        }

        return (
            <div className="content">
                {this.renderName()}
                {valueList}
                {this.renderError()}
            </div>
        );
    }
}

export default DescriptorItem;
