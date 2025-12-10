import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './AdminAddEditBook.css';

export default function AdminAddEditBook() {
    const [form, setForm] = useState({
        title: '',
        author: '',
        price: '',
        quantity: '',
        category: '',
        description: '',
        coverImageUrl: '',
        subject: '',
        genre: '',
        course: '',
        language: '',
        isTrending: false,
        pageCount: '',
        storyType: '',
        themeType: ''
    });

    const [status, setStatus] = useState('');
    const [originalForm, setOriginalForm] = useState(null);
    const [preview, setPreview] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            fetch(`/api/books/${id}`)
                .then(res => res.json())
                .then(data => {
                    const filledData = {
                        title: data.title || '',
                        author: data.author || '',
                        price: data.price || '',
                        quantity: data.quantity || '',
                        category: data.category || '',
                        description: data.description || '',
                        coverImageUrl: data.coverImageUrl || '',
                        subject: data.subject || '',
                        genre: data.genre || '',
                        course: data.course || '',
                        language: data.language || '',
                        isTrending: data.isTrending || false,
                        pageCount: data.pageCount || '',
                        storyType: data.storyType || '',
                        themeType: data.themeType || ''
                    };
                    setForm({ ...filledData });
                    setOriginalForm(JSON.parse(JSON.stringify(filledData)));
                    setPreview(
                        filledData.coverImageUrl
                            ? filledData.coverImageUrl.startsWith('http')
                                ? filledData.coverImageUrl
                                : `/${filledData.coverImageUrl}`
                            : ''
                    );
                })
                .catch(err => console.error(err));
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = id ? 'PUT' : 'POST';
        const url = id
            ? `/api/books/${id}`
            : '/api/books';

        const formData = new FormData();
        formData.append('Id', id || 0);
        formData.append('title', form.title);
        formData.append('author', form.author);
        formData.append('price', form.price);
        formData.append('quantity', form.quantity);
        formData.append('category', form.category);
        formData.append('description', form.description);
        formData.append('isTrending', form.isTrending ? 'true' : 'false');
        formData.append('pageCount', form.pageCount || 0);
        formData.append('storyType', form.storyType || '');
        formData.append('themeType', form.themeType || '');

        if (form.category === 'Medical') {
            formData.append('subject', form.subject);
        } else if (form.category === 'Fiction') {
            formData.append('genre', form.genre);
        } else if (form.category === 'Educational') {
            formData.append('course', form.course);
        } else if (form.category === 'Indian') {
            formData.append('language', form.language);
        }

        if (imageFile) {
            formData.append('file', imageFile);
        }

        try {
            const res = await fetch(url, {
                method,
                body: formData,
            });

            if (res.ok) {
                setStatus(id ? 'Book updated successfully' : 'Book added successfully');
                setTimeout(() => navigate('/admin/books'), 1000);
            } else {
                setStatus('Failed to save book');
            }
        } catch (err) {
            console.error(err);
            setStatus('Server error');
        }
    };

    const handleDiscard = () => {
        if (id && originalForm) {
            setForm(JSON.parse(JSON.stringify(originalForm)));
            setImageFile(null);
            setPreview(
                originalForm.coverImageUrl
                    ? originalForm.coverImageUrl.startsWith('http')
                        ? originalForm.coverImageUrl
                        : `/${originalForm.coverImageUrl}`
                    : ''
            );
            setStatus('Changes discarded');
        } else {
            navigate('/admin/books');
        }
    };

    return (
        <div className="add-edit-book-container">
            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </button>
            <h2>{id ? 'Edit Book' : ' Add New Book'}</h2>

            <form className="book-form" onSubmit={handleSubmit}>
                <table>
                    <tbody>
                        <tr>
                            <th>Title:</th>
                            <td>
                                <input required type="text" name="title" value={form.title} onChange={handleChange} />
                            </td>
                        </tr>

                        <tr>
                            <th>Author:</th>
                            <td>
                                <input type="text" name="author" value={form.author} onChange={handleChange} />
                            </td>
                        </tr>

                        <tr>
                            <th>Price:</th>
                            <td>
                                <input type="number" name="price" value={form.price} onChange={handleChange} />
                            </td>
                        </tr>

                        <tr>
                            <th>Quantity:</th>
                            <td>
                                <input type="number" name="quantity" value={form.quantity} onChange={handleChange} />
                            </td>
                        </tr>

                        <tr>
                            <th>Trending:</th>
                            <td>
                                <input
                                    type="checkbox"
                                    name="isTrending"
                                    checked={form.isTrending}
                                    onChange={(e) => setForm(prev => ({ ...prev, isTrending: e.target.checked }))}
                                />
                            </td>
                        </tr>

                        <tr>
                            <th>Category:</th>
                            <td>
                                <select name="category" value={form.category} onChange={handleChange} required>
                                    <option value="">Select</option>
                                    <option value="Medical">Medical</option>
                                    <option value="Fiction">Fiction</option>
                                    <option value="Educational">Educational</option>
                                    <option value="Indian">Indian</option>
                                </select>
                            </td>
                        </tr>

                        {form.category === 'Medical' && (
                            <tr>
                                <th>Subject:</th>
                                <td>
                                    <input type="text" name="subject" value={form.subject} onChange={handleChange} />
                                </td>
                            </tr>
                        )}
                        {form.category === 'Fiction' && (
                            <tr>
                                <th>Genre:</th>
                                <td>
                                    <input type="text" name="genre" value={form.genre} onChange={handleChange} />
                                </td>
                            </tr>
                        )}
                        {form.category === 'Educational' && (
                            <tr>
                                <th>Course:</th>
                                <td>
                                    <input type="text" name="course" value={form.course} onChange={handleChange} />
                                </td>
                            </tr>
                        )}
                        {form.category === 'Indian' && (
                            <tr>
                                <th>Language:</th>
                                <td>
                                    <input type="text" name="language" value={form.language} onChange={handleChange} />
                                </td>
                            </tr>
                        )}

                        <tr>
                            <th>Description:</th>
                            <td>
                                <textarea name="description" value={form.description} onChange={handleChange} />
                            </td>
                        </tr>

                        <tr>
                            <th>Cover Image:</th>
                            <td>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className='file'
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        setImageFile(file);
                                        if (file) {
                                            setPreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                                {preview && (
                                    <div className="image-preview-wrapper">
                                        <img src={preview} alt="Preview" className="preview-img" width="120" />
                                    </div>
                                )}
                            </td>
                        </tr>

                        <tr>
                            <th>Pages:</th>
                            <td>
                                <input type="number" name="pageCount" value={form.pageCount} onChange={handleChange} />
                            </td>
                        </tr>

                        <tr>
                            <th>Story Type:</th>
                            <td>
                                <input type="text" name="storyType" value={form.storyType} onChange={handleChange} />
                            </td>
                        </tr>

                        <tr>
                            <th>Theme:</th>
                            <td>
                                <input type="text" name="themeType" value={form.themeType} onChange={handleChange} />
                            </td>
                        </tr>

                        <tr>
                            <td colSpan="2">
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                    <button className='submit-button' type="submit">{id ? 'Update' : 'Add'} Book</button>
                                    <button className='dis-button' type="button" onClick={handleDiscard}>Clear</button>
                                </div>
                                {status && <p className="form-status">{status}</p>}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
        </div>
    );
}