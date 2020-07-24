import React, { useEffect, useState } from 'react';
import { Table, Message } from 'semantic-ui-react';
import { u8aToString } from '@polkadot/util';

import { useSubstrate } from '../substrate-lib';

export default function Main (props) {
  const { accountPair } = props;
  const { api } = useSubstrate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let unsub = null;

    const getProducts = async () => {
      const addr = accountPair.address;
      unsub = await api.query.productRegistry.productsOfOrganization(addr, productIds => {
        api.query.productRegistry.products.multi(productIds, products => {
          const validProducts = products
            .map(product => product.unwrap())
            .filter(product => !product.isEmpty);
          setProducts(validProducts);
        });
      });
    };

    if (accountPair) {
      getProducts();
    }

    return () => unsub && unsub();
  }, [accountPair, api, setProducts]);

  if (!products || products.length === 0) {
    return <Message warning>
      <Message.Header>No products existed for your organisation.</Message.Header>
      <p>Please create one using the above form.</p>
    </Message>;
  }

  return <Table color='blue'>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>ID</Table.HeaderCell>
        <Table.HeaderCell>Organization</Table.HeaderCell>
        <Table.HeaderCell>Description</Table.HeaderCell>
      </Table.Row>
    </Table.Header>

    <Table.Body>{ products.map(product => {
      const id = u8aToString(product.id);
      const props = product.props.unwrap();
      return <Table.Row key={id}>
        <Table.Cell>{ id }</Table.Cell>
        <Table.Cell>{ product.owner.toString() }</Table.Cell>
        <Table.Cell>{ u8aToString(props[0].value) }</Table.Cell>
      </Table.Row>;
    })}</Table.Body>
  </Table>;
}
