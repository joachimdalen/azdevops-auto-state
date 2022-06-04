import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import NewGroup from '../../../../rule-modal/components/work-item-filter/NewGroup';

describe('NewGroup', () => {
  it('should render default', async () => {
    const onAddGroupMock = jest.fn();
    render(<NewGroup existingNames={[]} onAddGroup={onAddGroupMock} />);
    await screen.findAllByText(/Add new group/);

    const textElement = screen.getByText(/Add new group/i);
    expect(textElement).toBeDefined();
  });
  it('should show input when add clicked', async () => {
    const onAddGroupMock = jest.fn();
    render(<NewGroup existingNames={[]} onAddGroup={onAddGroupMock} />);
    await screen.findAllByText(/Add new group/);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await screen.findAllByText(/The group name should be unique for this rule/);

    const input = screen.getByRole('textbox');
    expect(input).toBeDefined();
  });
  it('should reset state on cancel', async () => {
    const onAddGroupMock = jest.fn();
    render(<NewGroup existingNames={[]} onAddGroup={onAddGroupMock} />);
    await screen.findAllByText(/Add new group/);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await screen.findAllByText(/The group name should be unique for this rule/);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new-group' } });

    expect(input).toHaveValue('new-group');

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    await screen.findAllByText(/Add new group/);

    const buttonTwo = screen.getByRole('button');
    fireEvent.click(buttonTwo);

    const inputTwo = screen.getByRole('textbox');
    expect(inputTwo).toHaveValue('');
  });

  it('should validate on empty', async () => {
    const onAddGroupMock = jest.fn();
    render(<NewGroup existingNames={[]} onAddGroup={onAddGroupMock} />);
    await screen.findAllByText(/Add new group/);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await screen.findAllByText(/The group name should be unique for this rule/);

    const addButton = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(addButton);

    await screen.findAllByText(/Group name is a required field/);
  });

  it('should validate duplicate name', async () => {
    const onAddGroupMock = jest.fn();
    render(<NewGroup existingNames={['new-group']} onAddGroup={onAddGroupMock} />);
    await screen.findAllByText(/Add new group/);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await screen.findAllByText(/The group name should be unique for this rule/);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new-group' } });

    expect(input).toHaveValue('new-group');

    const addButton = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(addButton);

    await screen.findAllByText(/Group name already exists/);
  });
  it('should add item', async () => {
    const onAddGroupMock = jest.fn();
    render(<NewGroup existingNames={[]} onAddGroup={onAddGroupMock} />);
    await screen.findAllByText(/Add new group/);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await screen.findAllByText(/The group name should be unique for this rule/);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new-group' } });

    expect(input).toHaveValue('new-group');

    const addButton = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(addButton);

    await waitFor(() => expect(onAddGroupMock).toHaveBeenCalledWith('new-group'));
  });
});
