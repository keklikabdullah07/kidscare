import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaUrlField } from './MediaUrlField';

describe('MediaUrlField', () => {
  it('renders URL input with label', () => {
    render(<MediaUrlField value="" onChange={() => {}} label="Medya" />);
    expect(screen.getByText('Medya')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://...')).toBeInTheDocument();
  });

  it('calls onChange when Ekle button clicked (tekil mod)', async () => {
    const onChange = vi.fn();
    render(<MediaUrlField value="" onChange={onChange} />);
    const input = screen.getByPlaceholderText('https://...');
    fireEvent.change(input, { target: { value: 'https://example.com/x.jpg' } });
    const ekleBtn = screen.getByRole('button', { name: /^Ekle$/ });
    await userEvent.click(ekleBtn);
    expect(onChange).toHaveBeenCalledWith('https://example.com/x.jpg');
  });

  it('calls onValuesChange on Enter (coklu mod)', () => {
    const onValuesChange = vi.fn();
    render(
      <MediaUrlField
        value=""
        onChange={() => {}}
        values={['https://a/1.jpg']}
        onValuesChange={onValuesChange}
      />,
    );
    const input = screen.getByPlaceholderText('https://...');
    fireEvent.change(input, { target: { value: 'https://a/2.jpg' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onValuesChange).toHaveBeenCalledWith(['https://a/1.jpg', 'https://a/2.jpg']);
  });

  it('parses comma-separated URLs in coklu mod (Ekle)', () => {
    const onValuesChange = vi.fn();
    render(
      <MediaUrlField
        value=""
        onChange={() => {}}
        values={['https://a/1.jpg']}
        onValuesChange={onValuesChange}
      />,
    );
    const input = screen.getByPlaceholderText('https://...');
    fireEvent.change(input, {
      target: { value: 'https://a/2.jpg, https://a/3.jpg, https://a/4.jpg' },
    });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onValuesChange).toHaveBeenCalledWith([
      'https://a/1.jpg',
      'https://a/2.jpg',
      'https://a/3.jpg',
      'https://a/4.jpg',
    ]);
  });

  it('Ekle button is disabled when input is empty', () => {
    render(<MediaUrlField value="" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /^Ekle$/ })).toBeDisabled();
  });

  it('shows preview img when value is set and showPreview=true', () => {
    render(<MediaUrlField value="https://example.com/x.jpg" onChange={() => {}} showPreview />);
    const img = screen.getByAltText('Önizleme');
    expect(img.src).toBe('https://example.com/x.jpg');
  });

  it('hides preview when showPreview=false', () => {
    render(
      <MediaUrlField value="https://example.com/x.jpg" onChange={() => {}} showPreview={false} />,
    );
    expect(screen.queryByAltText('Önizleme')).not.toBeInTheDocument();
  });

  it('removes preview when X button clicked (tekil mod)', async () => {
    const onChange = vi.fn();
    render(<MediaUrlField value="https://example.com/x.jpg" onChange={onChange} />);
    const removeBtn = screen.getByTitle('Görseli kaldır');
    await userEvent.click(removeBtn);
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('renders Dosya button when allowFileUpload=true (default)', () => {
    render(<MediaUrlField value="" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /Dosya/i })).toBeInTheDocument();
  });

  it('hides Dosya button when allowFileUpload=false', () => {
    render(<MediaUrlField value="" onChange={() => {}} allowFileUpload={false} />);
    expect(screen.queryByRole('button', { name: /Dosya/i })).not.toBeInTheDocument();
  });

  it('clicks Dosya button triggers file picker (input.click spy)', () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
    render(<MediaUrlField value="" onChange={() => {}} />);
    const btn = screen.getByRole('button', { name: /Dosya/i });
    btn.click();
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('renders multiple previews when in multiple mode', () => {
    render(
      <MediaUrlField
        value=""
        onChange={() => {}}
        values={['https://a/1.jpg', 'https://a/2.jpg']}
        onValuesChange={() => {}}
        showMultiplePreview
      />,
    );
    expect(screen.getByAltText('Seçilen 1')).toBeInTheDocument();
    expect(screen.getByAltText('Seçilen 2')).toBeInTheDocument();
  });
});
