import React, { useState, useContext } from 'react';
import { Form, Button, Row, Col, Card, Spinner } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaGripVertical, FaTrash, FaPlus, FaSave } from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; 
import { ThemeContext } from '../../context/ThemeContext'; 
import api from '../../services/api';

const CustomFieldsTab = ({ inventory, onUpdate }) => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [fields, setFields] = useState(inventory.customFieldDefs || []);
  const [isSaving, setIsSaving] = useState(false);

  const handleDragEnd = (result) => {
    if (!result.destination) return; 

    const reorderedFields = Array.from(fields);
    const [movedItem] = reorderedFields.splice(result.source.index, 1);
    reorderedFields.splice(result.destination.index, 0, movedItem);

    setFields(reorderedFields);
  };

  const addField = () => {
    const fieldTypes = ['text', 'textarea', 'number', 'link', 'boolean', 'date'];
    const availableType = fieldTypes.find(type => fields.filter(f => f.type === type).length < 3);

    if (!availableType) {
      return alert(t('customFieldsTab.alerts.max_fields', "You have reached the maximum number of custom fields for all types."));
    }

    const newField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, 
      name: '',
      type: availableType,
      showInTable: true 
    };
    setFields([...fields, newField]);
  };

  const updateField = (index, key, value) => {
    if (key === 'type') {
      const currentTypeCount = fields.filter((f, i) => i !== index && f.type === value).length;
      if (currentTypeCount >= 3) {
        return alert(t('customFieldsTab.alerts.type_limit', `You can only have up to 3 fields of type "${value}".`, { type: value }));
      }
    }

    const updatedFields = [...fields];
    updatedFields[index][key] = value;
    setFields(updatedFields);
  };

  const deleteField = (index) => {
    const updatedFields = [...fields];
    updatedFields.splice(index, 1);
    setFields(updatedFields);
  };
  const handleSave = async () => {
    if (fields.some(f => f.name.trim() === '')) {
      return alert(t('customFieldsTab.alerts.empty_name', "All fields must have a name."));
    }

    setIsSaving(true);
    try {
      const response = await api.patch(`/inventories/${inventory.id}/auto-save`, {
        customFieldDefs: fields,
        currentVersion: inventory.version
      });
      
      onUpdate(response.data.data); 
      alert(t('customFieldsTab.alerts.save_success', "Custom fields saved successfully!"));
    } catch (error) {
      console.error("Failed to save fields:", error);
      if (error.response?.status === 409) {
        alert(t('customFieldsTab.alerts.conflict', "Conflict: Someone else modified this inventory. Please refresh."));
      } else {
        alert(t('customFieldsTab.alerts.save_error', "Failed to save. Please try again."));
      }
    } finally {
      setIsSaving(false);
    }
  };
  const textColor = isDark ? 'text-white' : 'text-dark';
  const mutedColor = isDark ? 'text-light opacity-75' : 'text-muted';
  const wrapperBgClass = isDark ? 'bg-dark border border-secondary' : 'bg-light border-0';
  const itemBgClass = isDark ? 'bg-dark border-secondary text-white' : 'bg-white';
  const inputBgClass = isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark';

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className={`mb-0 ${textColor}`}>{t('customFieldsTab.title', 'Custom Data Fields')}</h4>
          <p className={`${mutedColor} small mb-0`}>{t('customFieldsTab.subtitle', 'Define the exact data you want to collect for items in this inventory.')}</p>
        </div>
        <Button variant="success" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Spinner animation="border" size="sm" /> : <><FaSave className="me-2" /> {t('customFieldsTab.save_btn', 'Save Configuration')}</>}
        </Button>
      </div>

      <Card className={`shadow-sm p-3 mb-4 ${wrapperBgClass}`}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="custom-fields">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                
                {fields.length === 0 && (
                  <div className={`text-center p-4 border border-dashed rounded ${isDark ? 'text-light opacity-75 border-secondary bg-dark' : 'text-muted bg-white'}`}>
                    {t('customFieldsTab.no_fields', 'No custom fields defined yet. Click "Add Field" below.')}
                  </div>
                )}

                {fields.map((field, index) => (
                  <Draggable key={field.id} draggableId={field.id} index={index}>
                    {(provided, snapshot) => (
                      <Card 
                        className={`mb-2 ${snapshot.isDragging ? 'shadow-lg border-primary' : 'shadow-sm'} ${itemBgClass}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <Card.Body className="p-2 d-flex align-items-center">
                          <div 
                            {...provided.dragHandleProps} 
                            className={`px-2 ${mutedColor}`} 
                            style={{ cursor: 'grab' }}
                          >
                            <FaGripVertical />
                          </div>

                          <Row className="flex-grow-1 align-items-center g-2 m-0">
                            <Col md={7}>
                              <Form.Control 
                                type="text" 
                                placeholder={t('customFieldsTab.field_name_placeholder', 'Field Name (e.g. Serial Number)')} 
                                value={field.name}
                                onChange={(e) => updateField(index, 'name', e.target.value)}
                                className={inputBgClass}
                              />
                              <Form.Check 
                                type="switch"
                                id={`switch-${field.id}`}
                                label={t('customFieldsTab.show_in_table', 'Show in Items Table')}
                                checked={field.showInTable !== false} 
                                onChange={(e) => updateField(index, 'showInTable', e.target.checked)}
                                className={`mt-2 small ${mutedColor}`}
                              />
                            </Col>
                            <Col md={4}>
                              <Form.Select 
                                value={field.type} 
                                onChange={(e) => updateField(index, 'type', e.target.value)}
                                className={inputBgClass}
                              >
                                <option value="text">{t('customFieldsTab.types.text', 'Text (Single-line)')}</option>
                                <option value="textarea">{t('customFieldsTab.types.textarea', 'Text (Multi-line)')}</option>
                                <option value="number">{t('customFieldsTab.types.number', 'Number')}</option>
                                <option value="link">{t('customFieldsTab.types.link', 'Document/Image Link')}</option>
                                <option value="boolean">{t('customFieldsTab.types.boolean', 'Yes/No (Boolean)')}</option>
                                <option value="date">{t('customFieldsTab.types.date', 'Date')}</option>
                              </Form.Select>
                            </Col>
                            <Col md={1} className="text-end">
                              <Button variant="outline-danger" size="sm" onClick={() => deleteField(index)}>
                                <FaTrash />
                              </Button>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="mt-3">
          <Button variant={isDark ? "outline-info" : "outline-primary"} size="sm" onClick={addField}>
            <FaPlus className="me-2" /> {t('customFieldsTab.add_field_btn', 'Add Field')}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CustomFieldsTab;