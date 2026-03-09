import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Form, Button, Badge, Alert, ListGroup } from 'react-bootstrap';
import { FaSave, FaEye, FaGripVertical, FaTimes, FaPlus, FaCogs } from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; 
import { ThemeContext } from '../../context/ThemeContext'; 
import api from '../../services/api';

const CustomIdTab = ({ inventory, onUpdate }) => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [blocks, setBlocks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [draggedIdx, setDraggedIdx] = useState(null);

  useEffect(() => {
    if (inventory?.customIdFormat && Array.isArray(inventory.customIdFormat)) {
      setBlocks(inventory.customIdFormat);
    } else if (inventory?.customIdFormat?.prefix) {
      setBlocks([
        { id: '1', type: 'FIXED', value: inventory.customIdFormat.prefix + '-' },
        { id: '2', type: 'SEQUENCE' }
      ]);
    } else {
      setBlocks([
        { id: 'init1', type: 'FIXED', value: 'ITEM-' }, 
        { id: 'init2', type: 'SEQUENCE' }
      ]);
    }
  }, [inventory]);

  const addBlock = (type) => {
    setBlocks([...blocks, { id: Date.now().toString(), type, value: type === 'FIXED' ? '-' : '' }]);
  };

  const removeBlock = (index) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const updateBlockValue = (index, val) => {
    const newBlocks = [...blocks];
    newBlocks[index].value = val;
    setBlocks(newBlocks);
  };

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    
    const newBlocks = [...blocks];
    const draggedItem = newBlocks[draggedIdx];
    
    newBlocks.splice(draggedIdx, 1); 
    newBlocks.splice(targetIdx, 0, draggedItem); 
    
    setBlocks(newBlocks);
    setDraggedIdx(null);
  };

  const generatePreview = () => {
    if (blocks.length === 0) return t('customIdTab.empty_format', "EMPTY-FORMAT");
    return blocks.map(block => {
      switch (block.type) {
        case 'FIXED': return block.value || '';
        case 'SEQUENCE': return '001';
        case 'RANDOM_20': return 'A4F9C'; 
        case 'RANDOM_32': return 'B83D19F2'; 
        case 'GUID': return '123e4567-e89b-12d3-a456-426614174000';
        case 'DATE': return new Date().toISOString().slice(0, 10).replace(/-/g, '');
        default: return '';
      }
    }).join('');
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setSuccessMsg('');
    try {
      const formatData = {
        version: inventory.version,
        customIdFormat: blocks 
      };

      const response = await api.patch(`/inventories/${inventory.id}`, formatData);
      
      onUpdate({ 
        customIdFormat: response.data.data.customIdFormat,
        version: response.data.data.version 
      });
      
      setSuccessMsg(t('customIdTab.success_msg', 'Custom ID Blocks saved successfully!'));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      alert(error.response?.data?.message || t('customIdTab.error_msg', 'Failed to save format.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const textColor = isDark ? 'text-light' : 'text-secondary';
  const mutedColor = isDark ? 'text-light opacity-75' : 'text-muted';
  const cardBgClass = isDark ? 'bg-dark text-white border-secondary' : 'bg-white border-0';
  const headerBgClass = isDark ? 'bg-dark border-secondary' : 'bg-white border-bottom-0';
  const paletteBgClass = isDark ? 'bg-dark border-secondary' : 'bg-light border';
  const listItemClass = isDark ? 'bg-dark border-secondary text-white' : 'bg-white border';
  const inputBgClass = isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark';
  const previewBoxClass = isDark ? 'bg-dark border-info text-info' : 'bg-light border-primary text-primary';

  return (
    <div className="p-3">
      <h4 className={`mb-4 ${textColor}`}><FaCogs className="me-2" /> {t('customIdTab.title', 'Drag & Drop ID Builder')}</h4>
      
      <Row>
        <Col md={7}>
          <Card className={`shadow-sm mb-4 ${cardBgClass}`}>
            <Card.Header className={`pt-3 ${headerBgClass}`}>
              <h5 className="mb-0">{t('customIdTab.config_title', 'Format Blocks')}</h5>
            </Card.Header>
            <Card.Body>
              <div className={`mb-4 p-3 rounded border ${paletteBgClass}`}>
                <p className={`small mb-2 fw-bold text-uppercase ${mutedColor}`}>{t('customIdTab.step_1', '1. Click to add blocks')}</p>
                <div className="d-flex flex-wrap gap-2">
                  <Button variant={isDark ? "outline-primary" : "outline-primary"} size="sm" onClick={() => addBlock('FIXED')}><FaPlus className="me-1"/> {t('customIdTab.blocks.fixed', 'Fixed Text')}</Button>
                  <Button variant={isDark ? "outline-success" : "outline-success"} size="sm" onClick={() => addBlock('SEQUENCE')}><FaPlus className="me-1"/> {t('customIdTab.blocks.sequence', 'Sequence')}</Button>
                  <Button variant={isDark ? "outline-info" : "outline-info"} size="sm" onClick={() => addBlock('DATE')}><FaPlus className="me-1"/> {t('customIdTab.blocks.date', 'Date')}</Button>
                  <Button variant={isDark ? "outline-warning" : "outline-warning"} size="sm" onClick={() => addBlock('RANDOM_20')}><FaPlus className="me-1"/> {t('customIdTab.blocks.hash20', '20-bit Hash')}</Button>
                  <Button variant={isDark ? "outline-danger" : "outline-danger"} size="sm" onClick={() => addBlock('RANDOM_32')}><FaPlus className="me-1"/> {t('customIdTab.blocks.hash32', '32-bit Hash')}</Button>
                  <Button variant={isDark ? "outline-light" : "outline-dark"} size="sm" onClick={() => addBlock('GUID')}><FaPlus className="me-1"/> {t('customIdTab.blocks.guid', 'GUID')}</Button>
                </div>
              </div>

              <p className={`small mb-2 fw-bold text-uppercase ${mutedColor}`}>{t('customIdTab.step_2', '2. Drag handles (⋮⋮) to reorder')}</p>
              <ListGroup className="mb-3">
                {blocks.length === 0 && <Alert variant={isDark ? "dark" : "secondary"} className={isDark ? "border-secondary text-white" : ""}>{t('customIdTab.no_blocks', 'No blocks added.')}</Alert>}
                
                {blocks.map((block, index) => (
                  <ListGroup.Item 
                    key={block.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`d-flex align-items-center shadow-sm mb-2 rounded border ${listItemClass}`}
                    style={{ cursor: 'grab', opacity: draggedIdx === index ? 0.5 : 1 }}
                  >
                    <FaGripVertical className={`${mutedColor} me-3`} />
                    
                    <Badge bg="secondary" className="me-3 p-2" style={{ width: '120px' }}>
                      {block.type.replace('_', ' ')}
                    </Badge>

                    <div className="flex-grow-1 me-3">
                      {block.type === 'FIXED' ? (
                        <Form.Control 
                          size="sm" 
                          type="text" 
                          placeholder={t('customIdTab.input_placeholder', 'Text or Hyphen (e.g., -)')} 
                          value={block.value}
                          onChange={(e) => updateBlockValue(index, e.target.value)}
                          className={inputBgClass}
                        />
                      ) : (
                        <small className={mutedColor}>{t('customIdTab.auto_generated', 'Auto-generated by server')}</small>
                      )}
                    </div>

                    <Button variant="link" className="text-danger p-0" onClick={() => removeBlock(index)}>
                      <FaTimes />
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>

            </Card.Body>
          </Card>
        </Col>
        <Col md={5}>
          <Card className={`shadow-sm border-0 text-center sticky-top ${isDark ? 'bg-dark border-secondary' : ''}`} style={{ top: '20px' }}>
            <Card.Header className="bg-dark text-white pt-3 border-bottom-0">
              <h5 className="mb-0"><FaEye className="me-2" /> {t('customIdTab.preview_title', 'Live Preview')}</h5>
            </Card.Header>
            <Card.Body className={`p-5 ${isDark ? 'bg-dark border border-secondary text-white' : ''}`}>
              <p className={`mb-2 ${mutedColor}`}>{t('customIdTab.preview_subtitle', 'Items will be assigned IDs like this:')}</p>
              
              <div className={`p-3 border border-2 rounded mb-4 text-break ${previewBoxClass}`}>
                <h4 className="mb-0 fw-bold font-monospace">
                  {generatePreview()}
                </h4>
              </div>

              {successMsg && <Alert variant="success" className="py-2">{successMsg}</Alert>}

              <Button 
                variant="primary" 
                size="lg" 
                className="w-100 shadow-sm"
                onClick={handleSave}
                disabled={isSubmitting || blocks.length === 0}
              >
                {isSubmitting ? t('customIdTab.saving', 'Saving...') : <><FaSave className="me-2" /> {t('customIdTab.save_btn', 'Save Builder Format')}</>}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomIdTab;